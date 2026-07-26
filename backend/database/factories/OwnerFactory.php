<?php

namespace Database\Factories;

use App\Models\Agency;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Owner>
 */
class OwnerFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'agency_id' => Agency::factory(),
            'user_id' => null,
            'last_name' => fake()->lastName(),
            'first_name' => fake()->firstName(),
            'phone' => '77'.fake()->numerify('#######'),
            'email' => fake()->safeEmail(),
            'address' => fake()->address(),
            'id_document_number' => fake()->numerify('CNI-########'),
            'notes' => null,
        ];
    }

    /**
     * An owner who has an account and can follow their properties.
     */
    public function withAccount(): static
    {
        return $this->state(fn () => ['user_id' => User::factory()]);
    }
}
