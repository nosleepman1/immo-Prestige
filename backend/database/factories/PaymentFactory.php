<?php

namespace Database\Factories;

use App\Models\Agency;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'agency_id' => Agency::factory(),
            'subscription_id' => null,
            'purpose' => 'subscription',
            'amount' => fake()->randomElement([15000, 80000, 130000]),
            'status' => 'pending',
            'provider' => 'paydunya',
            'invoice_token' => fake()->unique()->uuid(),
        ];
    }
}
