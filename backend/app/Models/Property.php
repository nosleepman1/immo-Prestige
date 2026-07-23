<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    /** @use HasFactory<\Database\Factories\PropertyFactory> */
    use HasFactory, SoftDeletes;

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
        'longitude',
        'latitude',
        'sold',
        'is_active',
        'is_posted'
    ];

    protected $casts = [
        'furnished' => 'boolean',
        'sold' => 'boolean',
        'is_active' => 'boolean',
        'is_posted' => 'boolean',
        'price' => 'decimal:2',
        'rooms' => 'integer',
        'bedrooms' => 'integer',
        'longitude' => 'decimal:6',
        'latitude' => 'decimal:6',
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
