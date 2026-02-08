<?php

namespace Database\Factories;

use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PropertySaleDetail>
 */
class PropertySaleDetailFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'price' => fake()->numberBetween(5_000_000, 250_000_000),
            'negotiable' => fake()->boolean(30),
        ];
    }
}
