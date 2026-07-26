<?php

namespace Tests\Feature\Rental;

use App\Enums\LeaseStatus;
use App\Models\Agency;
use App\Models\Lease;
use App\Models\Property;
use App\Models\User;
use App\Notifications\LeaseSignatureRejected;
use App\Notifications\LeaseSignatureValidated;
use App\Notifications\SignedContractUploaded;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * The paper circuit: the tenant accepts the terms, prints, signs, scans and
 * returns; the agency checks what came back.
 */
class LeaseSignatureTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: User, 1: User, 2: Lease} */
    private function lease(LeaseStatus $status = LeaseStatus::PendingValidation): array
    {
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $property = Property::factory()->published()->forRent()->create(['agency_id' => $agency->id]);
        $tenant = User::factory()->create();

        $lease = Lease::factory()->status($status)->create([
            'property_id' => $property->id,
            'agency_id' => $agency->id,
            'tenant_user_id' => $tenant->id,
        ]);

        return [$agencyUser, $tenant, $lease];
    }

    private function scan(): UploadedFile
    {
        return UploadedFile::fake()->create('contrat-signe.pdf', 800, 'application/pdf');
    }

    public function test_the_tenant_accepts_the_terms(): void
    {
        [, $tenant, $lease] = $this->lease();

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/validate")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_signature');
    }

    public function test_the_agency_cannot_accept_the_terms_for_the_tenant(): void
    {
        [$agencyUser, , $lease] = $this->lease();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/validate")
            ->assertStatus(403);
    }

    public function test_terms_already_accepted_cannot_be_accepted_twice(): void
    {
        [, $tenant, $lease] = $this->lease(LeaseStatus::PendingSignature);

        // RG-L24: an explicit business error, never a silent no-op.
        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/validate")
            ->assertStatus(409);
    }

    public function test_the_tenant_returns_the_signed_contract(): void
    {
        Storage::fake('local');
        Notification::fake();
        [$agencyUser, $tenant, $lease] = $this->lease(LeaseStatus::PendingSignature);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/signed-contract", ['file' => $this->scan()])
            ->assertOk()
            ->assertJsonPath('data.has_signed_contract', true);

        Storage::disk('local')->assertExists($lease->fresh()->signed_contract_path);
        Notification::assertSentTo($agencyUser, SignedContractUploaded::class);
    }

    public function test_a_lease_not_waiting_for_a_signature_accepts_no_scan(): void
    {
        Storage::fake('local');
        [, $tenant, $lease] = $this->lease(LeaseStatus::PendingValidation);

        // RG-L11.
        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/signed-contract", ['file' => $this->scan()])
            ->assertStatus(409);
    }

    public function test_a_second_attempt_replaces_the_first_scan(): void
    {
        Storage::fake('local');
        Notification::fake();
        [, $tenant, $lease] = $this->lease(LeaseStatus::PendingSignature);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/signed-contract", ['file' => $this->scan()])->assertOk();
        $first = $lease->fresh()->signed_contract_path;

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/signed-contract", ['file' => $this->scan()])->assertOk();

        // A first scan is often unreadable; the superseded copy of a signed
        // contract must not linger unreferenced on the disk.
        Storage::disk('local')->assertMissing($first);
        Storage::disk('local')->assertExists($lease->fresh()->signed_contract_path);
    }

    public function test_the_agency_validates_the_signature_and_opens_the_payment(): void
    {
        Storage::fake('local');
        Notification::fake();
        [$agencyUser, $tenant, $lease] = $this->lease();
        $lease->update([
            'status' => LeaseStatus::PendingSignature,
            'signed_contract_path' => 'leases/x/signed.pdf',
            'signed_at' => now(),
        ]);

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/leases/{$lease->id}/validate-signature")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_payment');

        $this->assertSame($agencyUser->id, (int) $lease->fresh()->validated_by);
        Notification::assertSentTo($tenant, LeaseSignatureValidated::class);
    }

    public function test_the_agency_refuses_a_bad_scan_with_a_reason(): void
    {
        Storage::fake('local');
        Notification::fake();
        [$agencyUser, $tenant, $lease] = $this->lease(LeaseStatus::PendingSignature);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/signed-contract", ['file' => $this->scan()])->assertOk();
        $path = $lease->fresh()->signed_contract_path;

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/leases/{$lease->id}/reject-signature", [
                'reason' => 'La dernière page n\'est pas signée.',
            ])
            ->assertOk()
            // Back to waiting for a signature, not stuck in a dead end.
            ->assertJsonPath('data.status', 'pending_signature')
            ->assertJsonPath('data.has_signed_contract', false)
            ->assertJsonPath('data.signature_rejection_reason', 'La dernière page n\'est pas signée.');

        Storage::disk('local')->assertMissing($path);
        Notification::assertSentTo($tenant, LeaseSignatureRejected::class);
    }

    public function test_a_refusal_without_a_reason_is_rejected(): void
    {
        [$agencyUser, , $lease] = $this->lease();
        $lease->update(['status' => LeaseStatus::PendingSignature, 'signed_contract_path' => 'x.pdf']);

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/leases/{$lease->id}/reject-signature", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['reason']);
    }

    public function test_a_new_attempt_clears_the_previous_refusal(): void
    {
        Storage::fake('local');
        Notification::fake();
        [, $tenant, $lease] = $this->lease();
        $lease->update([
            'status' => LeaseStatus::PendingSignature,
            'signature_rejection_reason' => 'La dernière page n\'est pas signée.',
        ]);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/signed-contract", ['file' => $this->scan()])
            ->assertOk()
            // The old reason described the old scan; leaving it would
            // misdescribe this one.
            ->assertJsonPath('data.signature_rejection_reason', null);
    }

    public function test_a_signature_that_has_not_arrived_cannot_be_reviewed(): void
    {
        [$agencyUser, , $lease] = $this->lease(LeaseStatus::PendingSignature);

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/leases/{$lease->id}/validate-signature")
            ->assertStatus(409);
    }

    public function test_the_tenant_cannot_validate_their_own_signature(): void
    {
        [, $tenant, $lease] = $this->lease();
        $lease->update(['status' => LeaseStatus::PendingSignature, 'signed_contract_path' => 'x.pdf']);

        // RG-L12: the check belongs to the agency alone.
        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/agency/leases/{$lease->id}/validate-signature")
            ->assertStatus(403);
    }

    public function test_only_pdf_and_images_are_accepted_as_a_scan(): void
    {
        Storage::fake('local');
        [, $tenant, $lease] = $this->lease(LeaseStatus::PendingSignature);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/signed-contract", [
                'file' => UploadedFile::fake()->create('contrat.docx', 100),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }
}
