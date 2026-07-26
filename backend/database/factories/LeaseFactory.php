<?php

namespace Database\Factories;

use App\Enums\LeasePeriodicity;
use App\Enums\LeaseStatus;
use App\Models\Agency;
use App\Models\Lease;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lease>
 */
class LeaseFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = Carbon::parse(fake()->dateTimeBetween('-6 months', '+1 month')->format('Y-m-d'));
        $months = 12;
        $rent = fake()->numberBetween(15, 100) * 5_000;

        return [
            'reference' => fn () => Lease::nextReference(),
            'property_id' => Property::factory()->forRent(),
            'agency_id' => Agency::factory(),
            'tenant_user_id' => User::factory(),
            'start_date' => $start->toDateString(),
            'end_date' => $start->copy()->addMonths($months)->subDay()->toDateString(),
            'duration_months' => $months,
            'rent_amount' => $rent,
            'charges_amount' => 10_000,
            'deposit_amount' => $rent * 2,
            'advance_months' => 1,
            'periodicity' => LeasePeriodicity::Monthly,
            'payment_day' => 5,
            'notice_period_days' => 30,
            'status' => LeaseStatus::PendingValidation,
        ];
    }

    public function status(LeaseStatus $status): static
    {
        return $this->state(fn () => ['status' => $status]);
    }

    /**
     * Waiting for the agency to check a scan that has actually arrived.
     */
    public function awaitingSignatureReview(): static
    {
        return $this->state(fn () => [
            'status' => LeaseStatus::PendingSignature,
            'signed_contract_path' => 'leases/fake/signed/contrat-signe.pdf',
            'signed_at' => now(),
        ]);
    }
}
