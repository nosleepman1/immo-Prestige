<?php

namespace Tests\Feature\Rental;

use App\Enums\RentalApplicationStatus;
use App\Models\Agency;
use App\Models\Property;
use App\Models\RentalApplication;
use App\Models\RentalApplicationDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Supporting documents are identity papers and payslips: they must live on the
 * private disk and never be reachable without going through the policy.
 */
class ApplicationDocumentTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: User, 1: User, 2: RentalApplication} */
    private function application(): array
    {
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $property = Property::factory()->published()->forRent()->create(['agency_id' => $agency->id]);
        $client = User::factory()->create();

        $application = RentalApplication::factory()->create([
            'property_id' => $property->id,
            'agency_id' => $agency->id,
            'applicant_user_id' => $client->id,
        ]);

        return [$agencyUser, $client, $application];
    }

    public function test_the_candidate_attaches_a_document(): void
    {
        Storage::fake('local');
        [, $client, $application] = $this->application();

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/rental-applications/{$application->id}/documents", [
                'type' => 'identity_document',
                'file' => UploadedFile::fake()->create('cni.pdf', 200, 'application/pdf'),
            ])
            ->assertCreated()
            ->assertJsonPath('data.original_name', 'cni.pdf')
            ->assertJsonPath('data.type_label', "Pièce d'identité");

        $document = RentalApplicationDocument::first();
        Storage::disk('local')->assertExists($document->file_path);

        // Private disk only: nothing lands where a URL could reach it.
        Storage::disk('public')->assertMissing($document->file_path);
    }

    public function test_the_stored_path_is_never_exposed(): void
    {
        Storage::fake('local');
        [, $client, $application] = $this->application();

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/rental-applications/{$application->id}/documents", [
                'type' => 'proof_of_income',
                'file' => UploadedFile::fake()->create('bulletin.pdf', 100, 'application/pdf'),
            ])
            ->assertCreated()
            ->assertJsonMissingPath('data.file_path')
            ->assertJsonStructure(['data' => ['download_url']]);
    }

    public function test_the_owning_agency_downloads_a_document(): void
    {
        Storage::fake('local');
        [$agencyUser, $client, $application] = $this->application();

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/rental-applications/{$application->id}/documents", [
                'type' => 'identity_document',
                'file' => UploadedFile::fake()->create('cni.pdf', 100, 'application/pdf'),
            ])->assertCreated();

        $document = RentalApplicationDocument::first();

        // The agency needs it to instruct the file.
        $this->actingAs($agencyUser, 'sanctum')
            ->get("/api/v1/rental-application-documents/{$document->id}")
            ->assertOk();
    }

    public function test_a_stranger_cannot_download_a_document(): void
    {
        Storage::fake('local');
        [, , $application] = $this->application();
        $document = RentalApplicationDocument::factory()->create([
            'rental_application_id' => $application->id,
        ]);

        $this->actingAs(User::factory()->create(), 'sanctum')
            ->get("/api/v1/rental-application-documents/{$document->id}")
            ->assertStatus(403);
    }

    public function test_another_agency_cannot_download_a_document(): void
    {
        Storage::fake('local');
        [, , $application] = $this->application();
        $document = RentalApplicationDocument::factory()->create([
            'rental_application_id' => $application->id,
        ]);

        $otherAgencyUser = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $otherAgencyUser->id]);

        $this->actingAs($otherAgencyUser, 'sanctum')
            ->get("/api/v1/rental-application-documents/{$document->id}")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_download_a_document(): void
    {
        [, , $application] = $this->application();
        $document = RentalApplicationDocument::factory()->create([
            'rental_application_id' => $application->id,
        ]);

        $this->get("/api/v1/rental-application-documents/{$document->id}")->assertStatus(401);
    }

    public function test_only_documents_and_images_are_accepted(): void
    {
        Storage::fake('local');
        [, $client, $application] = $this->application();

        // An executable on a disk holding identity papers is a liability.
        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/rental-applications/{$application->id}/documents", [
                'type' => 'other',
                'file' => UploadedFile::fake()->create('script.exe', 10, 'application/x-msdownload'),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_an_oversized_document_is_refused(): void
    {
        Storage::fake('local');
        [, $client, $application] = $this->application();

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/rental-applications/{$application->id}/documents", [
                'type' => 'other',
                'file' => UploadedFile::fake()->create('gros.pdf', 6000, 'application/pdf'),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_a_decided_application_accepts_no_further_document(): void
    {
        Storage::fake('local');
        [, $client, $application] = $this->application();
        $application->update(['status' => RentalApplicationStatus::Rejected]);

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/rental-applications/{$application->id}/documents", [
                'type' => 'other',
                'file' => UploadedFile::fake()->create('tardif.pdf', 100, 'application/pdf'),
            ])
            ->assertStatus(409);
    }

    public function test_the_agency_cannot_attach_a_document_in_the_candidates_place(): void
    {
        Storage::fake('local');
        [$agencyUser, , $application] = $this->application();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/rental-applications/{$application->id}/documents", [
                'type' => 'other',
                'file' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
            ])
            ->assertStatus(403);
    }

    public function test_the_candidate_removes_their_own_document(): void
    {
        Storage::fake('local');
        [, $client, $application] = $this->application();

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/rental-applications/{$application->id}/documents", [
                'type' => 'other',
                'file' => UploadedFile::fake()->create('doublon.pdf', 100, 'application/pdf'),
            ])->assertCreated();

        $document = RentalApplicationDocument::first();
        $path = $document->file_path;

        $this->actingAs($client, 'sanctum')
            ->deleteJson("/api/v1/rental-application-documents/{$document->id}")
            ->assertNoContent();

        // The file leaves the disk too — a soft-deleted row pointing at a live
        // copy of someone's ID card is not a deletion.
        Storage::disk('local')->assertMissing($path);
    }
}
