<?php

namespace Database\Factories;

use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PropertyRentalDetail>
 */
class PropertyRentalDetailFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Rents rounded to 5 000 XOF, the way they are actually quoted in Dakar.
        $rent = fake()->numberBetween(15, 100) * 5_000;

        return [
            'property_id' => Property::factory(),
            'rent_amount' => $rent,
            'charges_amount' => fake()->randomElement([0, 5_000, 10_000, 15_000]),
            'deposit_amount' => $rent * fake()->numberBetween(1, 3),
            'advance_months' => fake()->numberBetween(1, 3),
            'min_lease_months' => fake()->randomElement([12, 24, 36]),
            'available_from' => fake()->optional()->dateTimeBetween('now', '+3 months'),
        ];
    }
}
