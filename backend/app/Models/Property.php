<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    /** @use HasFactory<\Database\Factories\PropertyFactory> */
    use HasFactory;

    protected $fillable = [
        'property_type_id',
        'agency_id',
        'devise_id',
        'name',
        'description',
        'surface',
        'rooms',
        'bedrooms',
        'floor',
        'furnished',
        'price',
        'country',
        'region',
        'city',
        'address',
        'longitude',
        'latitude',
        'sold',
        'is_active',
        'is_posted'
    ];


    public function propertyType()
    {
        return $this->belongsTo(PropertyType::class);
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function devise()
    {
        return $this->belongsTo(Devise::class);
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class);
    }



    public function post() {
        return $this->hasMany(Post::class);
    }





}
