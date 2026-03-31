<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->text(),
            'surface' => fake()->randomFloat(2, 20, 500),
            'rooms' => fake()->numberBetween(1, 10),
            'bedrooms' => fake()->numberBetween(1, 4),
            'floor' => fake()->numberBetween(0, 5),
            'furnished' => fake()->boolean(),
            'price' => fake()->randomFloat(2, 50000, 2000000),
            'country' => 'Sénégal',
            'region' => fake()->state(),
            'city' => fake()->city(),
            'longitude' => fake()->longitude(-18.0, -11.0),
            'latitude' => fake()->latitude(12.0, 16.0),
            'sold' => fake()->boolean(10),
            'is_active' => true,
            'is_posted' => true,
        ];
    }
}
