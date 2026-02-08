<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    /** @use HasFactory<\Database\Factories\PlanFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'billing_period_months',
        'property_quota',
        'featured_quota',
        'is_active',
    ];

    protected $casts = [
        'price' => 'integer',
        'billing_period_months' => 'integer',
        'property_quota' => 'integer',
        'featured_quota' => 'integer',
        'is_active' => 'boolean',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
