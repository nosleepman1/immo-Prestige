<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Agency>
 */
class AgencyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_name' => fake()->unique()->company(),
            'manager_name' => fake()->name(),
            'description' => fake()->paragraph(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'activity_zone' => fake()->city(),
            'phone' => fake()->phoneNumber(),
            'id_card' => fake()->unique()->uuid(),
            'status' => 'accepted',
            'activated_at' => now(),
            'user_id' => User::factory()->agency(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => 'pending', 'activated_at' => null]);
    }

    public function refused(): static
    {
        return $this->state(fn () => [
            'status' => 'refused',
            'refusal_reason' => fake()->sentence(),
            'activated_at' => null,
        ]);
    }
}
