<?php

namespace Database\Factories;

use App\Models\MaintenanceTicket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MaintenanceTicketMessage>
 */
class MaintenanceTicketMessageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'maintenance_ticket_id' => MaintenanceTicket::factory(),
            'user_id' => User::factory(),
            'body' => fake()->sentence(),
        ];
    }
}
