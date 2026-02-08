<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Plan>
 */
class PlanFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 100000),
            'price' => fake()->randomElement([15000, 80000, 130000]),
            'billing_period_months' => fake()->randomElement([1, 6, 12]),
            'property_quota' => 10,
            'featured_quota' => 1,
            'is_active' => true,
        ];
    }
}
