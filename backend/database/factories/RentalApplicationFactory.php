<?php

namespace Database\Factories;

use App\Enums\RentalApplicationStatus;
use App\Models\Agency;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RentalApplication>
 */
class RentalApplicationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'property_id' => Property::factory()->forRent(),
            'agency_id' => Agency::factory(),
            'applicant_user_id' => User::factory(),
            'status' => RentalApplicationStatus::Submitted,
            'desired_start_date' => fake()->dateTimeBetween('+1 week', '+2 months')->format('Y-m-d'),
            'desired_duration_months' => fake()->randomElement([12, 24, 36]),
            'message' => fake()->optional()->sentence(),
        ];
    }

    public function status(RentalApplicationStatus $status): static
    {
        return $this->state(fn () => ['status' => $status]);
    }

    public function rejected(string $reason = 'Dossier incomplet.'): static
    {
        return $this->state(fn () => [
            'status' => RentalApplicationStatus::Rejected,
            'rejection_reason' => $reason,
            'reviewed_at' => now(),
        ]);
    }
}
