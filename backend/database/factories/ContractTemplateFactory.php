<?php

namespace Database\Factories;

use App\Models\Agency;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ContractTemplate>
 */
class ContractTemplateFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'agency_id' => Agency::factory(),
            'name' => 'Bail habitation '.fake()->year(),
            'is_default' => false,
        ];
    }

    public function isDefault(): static
    {
        return $this->state(fn () => ['is_default' => true]);
    }
}
