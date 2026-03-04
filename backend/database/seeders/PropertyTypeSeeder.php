<?php

namespace Database\Seeders;

use App\Models\PropertyType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PropertyTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $propertyTypes = [
            ['name' => 'Appartement'],
            ['name' => 'Maison'],
            ['name' => 'Villa'],
            ['name' => 'Studio'],
            ['name' => 'Duplex'],
            ['name' => 'Loft'],
            ['name' => 'Chambre'],
            ['name' => 'Bureau'],
            ['name' => 'Local commercial'],
            ['name' => 'Terrain'],
        ];

        foreach ($propertyTypes as $propertyType) {
            PropertyType::create($propertyType);
        }
    }
}
