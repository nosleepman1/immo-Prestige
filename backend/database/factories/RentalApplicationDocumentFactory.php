<?php

namespace Database\Factories;

use App\Enums\RentalDocumentType;
use App\Models\RentalApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RentalApplicationDocument>
 */
class RentalApplicationDocumentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'rental_application_id' => RentalApplication::factory(),
            'type' => fake()->randomElement(RentalDocumentType::cases()),
            'file_path' => 'rental-applications/1/'.fake()->uuid().'.pdf',
            'original_name' => 'cni.pdf',
            'size_bytes' => fake()->numberBetween(50_000, 2_000_000),
            'mime_type' => 'application/pdf',
        ];
    }
}
