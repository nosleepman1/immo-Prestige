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
            ['name' => 'Euro', 'code' => '€'],
            ['name' => 'Dollar', 'code' => '$'],
            ['name' => 'Pound', 'code' => '£'],
            ['name' => 'CFA', 'code' => 'CFA'],
            ['name'=> 'Yen', 'code'=> '¥'],
            ['name'=> 'Yuan', 'code'=> 'Y'],       
        ];

        foreach ($devises as $devise) {
            Devise::create($devise);
        }
    }
}
