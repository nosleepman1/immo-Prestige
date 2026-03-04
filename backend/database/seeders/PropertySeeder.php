<?php

namespace Database\Seeders;

use App\Models\Property;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $property = [
            [
                "name" => "Mohamed TINE",
                "email" => "tine@gmail.com",
                "password" => "tine@gmail.com",
                "password_confirmation" => "tine@gmail.com",
                "role" => "agency",

                "company_name" => "AMBO TECH",
                "description" => "Nous sommes une startup tech qui evolue auussi dans le secteur de l'immobilier",
                "address" => "Keur Massar",
                "city" => "Dakar",
                "phone" => "773757077",
                "id_card" => "16482000021"
            ]   
        ];

        foreach ($property as $prop) {
            Property::create($prop);
        }
    }
}
