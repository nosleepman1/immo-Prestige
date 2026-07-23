<?php

namespace Database\Factories;

use App\Models\Agency;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'agency_id' => Agency::factory(),
            'plan_id' => null,
            'status' => 'trialing',
            'trial_ends_at' => now()->addDays(30),
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => 'active',
            'plan_id' => \App\Models\Plan::factory(),
            'trial_ends_at' => null,
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'status' => 'expired',
            'trial_ends_at' => now()->subDay(),
            'ends_at' => now()->subDay(),
        ]);
    }
}
