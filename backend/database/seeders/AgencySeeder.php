<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AgencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'tine@gmail.com'],
            [
                'name' => 'Mohamed TINE',
                'password' => \Illuminate\Support\Facades\Hash::make('tine@gmail.com'),
                'role' => 'agency'
            ]
        );

        Agency::create([
            'user_id' => $user->id,
            'company_name' => 'AMBO TECH',
            'description' => "Nous sommes une startup tech qui evolue auussi dans le secteur de l'immobilier",
            'address' => 'Keur Massar',
            'city' => 'Dakar',
            'phone' => '773757077',
            'id_card' => '16482000021'
        ]);
    }
}
