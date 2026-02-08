<?php

namespace Database\Factories;

use App\Models\Agency;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AgencyDocument>
 */
class AgencyDocumentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'agency_id' => Agency::factory(),
            'type' => 'id_card',
            'path' => 'agency_documents/'.fake()->uuid().'.pdf',
            'original_name' => fake()->word().'.pdf',
        ];
    }
}
