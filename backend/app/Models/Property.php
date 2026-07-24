<?php

namespace App\Models;

use App\Enums\PropertyStatus;
use Illuminate\Database\Eloquent\Builder;
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
        'status',
    ];

    protected $casts = [
        'furnished' => 'boolean',
        'sold' => 'boolean',
        'status' => PropertyStatus::class,
        'price' => 'decimal:2',
        'rooms' => 'integer',
        'bedrooms' => 'integer',
        'longitude' => 'decimal:6',
        'latitude' => 'decimal:6',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', PropertyStatus::Published->value);
    }

    public function isPublished(): bool
    {
        return $this->status === PropertyStatus::Published;
    }


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
        return $this->hasMany(PropertyImage::class)->orderBy('position');
    }



    public function post() {
        return $this->hasMany(Post::class);
    }





}
