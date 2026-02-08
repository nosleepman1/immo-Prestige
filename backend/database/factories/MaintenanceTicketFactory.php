<?php

namespace Database\Factories;

use App\Enums\MaintenanceCategory;
use App\Enums\MaintenancePriority;
use App\Enums\MaintenanceStatus;
use App\Models\Lease;
use App\Models\MaintenanceTicket;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MaintenanceTicket>
 */
class MaintenanceTicketFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lease_id' => Lease::factory(),
            'property_id' => Property::factory()->forRent(),
            'reported_by_user_id' => User::factory(),
            'category' => fake()->randomElement(MaintenanceCategory::cases()),
            'priority' => MaintenancePriority::Normal,
            'title' => 'Fuite sous l évier de la cuisine',
            'description' => fake()->paragraph(),
            'status' => MaintenanceStatus::Open,
        ];
    }

    public function status(MaintenanceStatus $status): static
    {
        return $this->state(fn () => ['status' => $status]);
    }

    public function urgent(): static
    {
        return $this->state(fn () => ['priority' => MaintenancePriority::Urgent]);
    }
}
