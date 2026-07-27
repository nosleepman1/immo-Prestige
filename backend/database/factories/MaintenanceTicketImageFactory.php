<?php

namespace Database\Factories;

use App\Models\MaintenanceTicket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MaintenanceTicketImage>
 */
class MaintenanceTicketImageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'maintenance_ticket_id' => MaintenanceTicket::factory(),
            'image_path' => 'maintenance/1/'.fake()->uuid().'.jpg',
            'position' => 0,
        ];
    }
}
