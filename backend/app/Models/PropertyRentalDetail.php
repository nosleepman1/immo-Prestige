<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyRentalDetail extends Model
{
    /** @use HasFactory<\Database\Factories\PropertyRentalDetailFactory> */
    use HasFactory;

    protected $fillable = [
        'property_id',
        'rent_amount',
        'charges_amount',
        'deposit_amount',
        'advance_months',
        'min_lease_months',
        'available_from',
    ];

    protected $casts = [
        'rent_amount' => 'integer',
        'charges_amount' => 'integer',
        'deposit_amount' => 'integer',
        'advance_months' => 'integer',
        'min_lease_months' => 'integer',
        'available_from' => 'date',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * What a tenant actually owes every month, rent and charges together.
     */
    public function monthlyTotal(): int
    {
        return $this->rent_amount + $this->charges_amount;
    }

    /**
     * Cash due before the keys are handed over: deposit plus the months paid in
     * advance. Quoted on the listing so a candidate is never surprised.
     */
    public function moveInCost(): int
    {
        return $this->deposit_amount + ($this->monthlyTotal() * $this->advance_months);
    }
}
