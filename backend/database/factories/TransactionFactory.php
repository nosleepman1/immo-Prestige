<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'payment_id' => Payment::factory(),
            'event' => 'ipn_received',
            'external_ref' => fake()->unique()->uuid(),
            'signature_valid' => true,
            'payload' => ['status' => 'completed'],
        ];
    }
}
