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
    //     $property = [
    //         [
    //             "id" => number_format(0,2,".",""),
    //             "name"=> fake("property")->name,
    //             "description"=> fake("property")->text(200),
    //             "price"=> fake("property")->numberBetween(100000,1000000),
    //             "city"=> fake("property")->text(50) ,   
    //             "country"=> fake("property")->text(50),
    //             "property_type_id"=> 1,
    //             "bedrooms"=> fake("property")->numberBetween(1,10),
    //             "bathrooms"=> fake("property")->numberBetween(1,10),
    //             "area"=> fake("property")->numberBetween(100,1000),
    //             "year_built"=> fake("property")->numberBetween(1900,2022),
    //             "status"=> fake("property")->text(50),
    //             "agency_id"=> 1,
    //             "user_id"=> 1,  
    //         ]   
    //     ];

    //     foreach ($property as $prop) {
    //         Property::create($prop);
    //     }
    }
}
