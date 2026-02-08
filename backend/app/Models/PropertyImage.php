<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PropertyImage extends Model
{
    /** @use HasFactory<\Database\Factories\PropertyImageFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'image_path',
        'is_cover',
        'position',
    ];

    protected $casts = [
        'is_cover' => 'boolean',
        'position' => 'integer',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
