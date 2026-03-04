<?php

namespace Database\Seeders;

use App\Models\Devise;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeviseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $devises = [
            ['name' => 'Euro', 'symbol' => '€'],
            ['name' => 'Dollar', 'symbol' => '$'],
            ['name' => 'Pound', 'symbol' => '£'],
            ['name' => 'CFA', 'symbol' => 'CFA'],
            ['name'=> 'Yen', 'symbol'=> '¥'],
            ['name'=> 'Yuan', 'symbol'=> '¥'],       
        ];

        foreach ($devises as $devise) {
            Devise::create($devise);
        }
    }
}
