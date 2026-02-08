<?php

namespace Database\Factories;

use App\Models\ContractTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ContractClause>
 */
class ContractClauseFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'contract_template_id' => ContractTemplate::factory(),
            'position' => 0,
            'title' => 'Obligations du preneur',
            'body' => 'Le preneur s\'engage à occuper paisiblement {{bien.designation}} '
                .'et à régler le loyer de {{bail.loyer}} le {{bail.jour_echeance}} de chaque mois.',
            'is_required' => false,
        ];
    }
}
