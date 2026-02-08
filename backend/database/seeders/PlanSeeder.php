<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            ['name' => 'Mensuel', 'slug' => 'monthly', 'price' => 15000, 'billing_period_months' => 1, 'property_quota' => 10, 'featured_quota' => 1],
            ['name' => 'Semestriel', 'slug' => 'biannual', 'price' => 80000, 'billing_period_months' => 6, 'property_quota' => 50, 'featured_quota' => 5],
            ['name' => 'Annuel', 'slug' => 'annual', 'price' => 130000, 'billing_period_months' => 12, 'property_quota' => null, 'featured_quota' => 15],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
