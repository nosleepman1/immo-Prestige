<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertySaleDetail extends Model
{
    /** @use HasFactory<\Database\Factories\PropertySaleDetailFactory> */
    use HasFactory;

    protected $fillable = [
        'property_id',
        'price',
        'negotiable',
    ];

    protected $casts = [
        'price' => 'integer',
        'negotiable' => 'boolean',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
