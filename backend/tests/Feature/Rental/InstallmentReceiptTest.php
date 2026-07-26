<?php

namespace Tests\Feature\Rental;

use App\Actions\Rental\ApplyPaymentToInstallments;
use App\Enums\LeaseStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use App\Models\Agency;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use App\Models\Payment;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InstallmentReceiptTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: User, 1: User, 2: LeaseInstallment} */
    private function settledMonth(): array
    {
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $property = Property::factory()->published()->forRent()->create(['agency_id' => $agency->id]);
        $tenant = User::factory()->create();

        $lease = Lease::factory()->status(LeaseStatus::Active)->create([
            'property_id' => $property->id,
            'agency_id' => $agency->id,
            'tenant_user_id' => $tenant->id,
        ]);

        $installment = LeaseInstallment::factory()->create(['lease_id' => $lease->id]);

        $payment = Payment::create([
            'agency_id' => $agency->id,
            'lease_id' => $lease->id,
            'payer_user_id' => $tenant->id,
            'purpose' => PaymentPurpose::Rent,
            'amount' => $installment->total_amount,
            'status' => PaymentStatus::Paid,
            'method' => PaymentMethod::Cash,
            'validated_by' => $agencyUser->id,
            'validated_at' => now(),
        ]);

        app(ApplyPaymentToInstallments::class)->handle($payment, collect([$installment]));

        return [$agencyUser, $tenant, $installment->fresh()];
    }

    public function test_the_tenant_downloads_the_receipt(): void
    {
        Storage::fake('local');
        [, $tenant, $installment] = $this->settledMonth();

        $this->actingAs($tenant, 'sanctum')
            ->get("/api/v1/installments/{$installment->id}/receipt")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        Storage::disk('local')->assertExists($installment->fresh()->receipt_path);
    }

    public function test_the_agency_downloads_the_receipt(): void
    {
        Storage::fake('local');
        [$agencyUser, , $installment] = $this->settledMonth();

        $this->actingAs($agencyUser, 'sanctum')
            ->get("/api/v1/installments/{$installment->id}/receipt")
            ->assertOk();
    }

    public function test_an_unsettled_month_yields_no_receipt(): void
    {
        Storage::fake('local');
        [, $tenant, $installment] = $this->settledMonth();
        $installment->lease->installments()->create([
            'reference' => LeaseInstallment::nextReference(),
            'period_start' => today()->addMonth()->startOfMonth()->toDateString(),
            'period_end' => today()->addMonth()->endOfMonth()->toDateString(),
            'due_date' => today()->addMonth()->startOfMonth()->addDays(4)->toDateString(),
            'rent_amount' => 150_000,
            'charges_amount' => 10_000,
            'total_amount' => 160_000,
        ]);
        $unpaid = $installment->lease->installments()->latest('id')->first();

        // A receipt says a period is paid. Issuing one for a partial payment
        // would hand the tenant a document saying more than the truth.
        $this->actingAs($tenant, 'sanctum')
            ->getJson("/api/v1/installments/{$unpaid->id}/receipt")
            ->assertStatus(422);
    }

    public function test_the_receipt_is_rendered_once_and_kept(): void
    {
        Storage::fake('local');
        [, $tenant, $installment] = $this->settledMonth();

        $this->actingAs($tenant, 'sanctum')->get("/api/v1/installments/{$installment->id}/receipt")->assertOk();
        $first = $installment->fresh()->receipt_path;

        $this->actingAs($tenant, 'sanctum')->get("/api/v1/installments/{$installment->id}/receipt")->assertOk();

        // The same period must always yield the same paper.
        $this->assertSame($first, $installment->fresh()->receipt_path);
    }

    public function test_a_stranger_cannot_download_a_receipt(): void
    {
        Storage::fake('local');
        [, , $installment] = $this->settledMonth();

        $this->actingAs(User::factory()->create(), 'sanctum')
            ->getJson("/api/v1/installments/{$installment->id}/receipt")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_download_a_receipt(): void
    {
        Storage::fake('local');
        [, , $installment] = $this->settledMonth();

        $this->get("/api/v1/installments/{$installment->id}/receipt")->assertStatus(401);
    }

    public function test_the_ledger_lists_the_imputations_behind_each_month(): void
    {
        [$agencyUser, $tenant, $installment] = $this->settledMonth();

        $this->actingAs($tenant, 'sanctum')
            ->getJson("/api/v1/leases/{$installment->lease_id}/installments")
            ->assertOk()
            ->assertJsonPath('data.0.status', 'paid')
            ->assertJsonPath('data.0.remaining_due', 0)
            // The receipt quotes who took the money and when.
            ->assertJsonPath('data.0.imputations.0.recorded_by', $agencyUser->name)
            ->assertJsonPath('data.0.imputations.0.applied_amount', $installment->total_amount);
    }
}
