<?php

namespace Database\Factories;

use App\Enums\InstallmentStatus;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeaseInstallment>
 */
class LeaseInstallmentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = Carbon::parse(fake()->dateTimeBetween('-3 months', '+2 months')->format('Y-m-01'));
        $rent = 150_000;
        $charges = 10_000;

        return [
            'lease_id' => Lease::factory(),
            'period_start' => $start->toDateString(),
            'period_end' => $start->copy()->addMonth()->subDay()->toDateString(),
            'due_date' => $start->copy()->day(5)->toDateString(),
            'rent_amount' => $rent,
            'charges_amount' => $charges,
            'total_amount' => $rent + $charges,
            'paid_amount' => 0,
            'status' => InstallmentStatus::Pending,
        ];
    }

    public function forPeriod(string $firstDay): static
    {
        $start = Carbon::parse($firstDay);

        return $this->state(fn () => [
            'period_start' => $start->toDateString(),
            'period_end' => $start->copy()->addMonth()->subDay()->toDateString(),
            'due_date' => $start->copy()->day(5)->toDateString(),
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn () => [
            'due_date' => today()->subDays(10)->toDateString(),
            'status' => InstallmentStatus::Late,
        ]);
    }

    public function settled(): static
    {
        return $this->state(fn (array $attrs) => [
            'paid_amount' => $attrs['total_amount'],
            'status' => InstallmentStatus::Paid,
            'paid_at' => now(),
        ]);
    }
}
