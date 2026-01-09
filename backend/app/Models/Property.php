<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    /** @use HasFactory<\Database\Factories\PropertyFactory> */
    use HasFactory;


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
}