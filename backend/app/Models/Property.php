<?php

namespace App\Models;

use App\Enums\PropertyAvailability;
use App\Enums\PropertyStatus;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    /** @use HasFactory<\Database\Factories\PropertyFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_type_id',
        'agency_id',
        'owner_id',
        'devise_id',
        'transaction_type',
        'name',
        'description',
        'surface',
        'rooms',
        'bedrooms',
        'floor',
        'furnished',
        'country',
        'region',
        'city',
        'longitude',
        'latitude',
        'availability',
        'status',
    ];

    protected $casts = [
        'furnished' => 'boolean',
        'status' => PropertyStatus::class,
        'transaction_type' => TransactionType::class,
        'availability' => PropertyAvailability::class,
        'rooms' => 'integer',
        'bedrooms' => 'integer',
        'longitude' => 'decimal:6',
        'latitude' => 'decimal:6',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', PropertyStatus::Published->value);
    }

    /**
     * Listings still open to an offer or a rental application.
     */
    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('availability', PropertyAvailability::Available->value);
    }

    /**
     * Listings offered for the given transaction, `both` matching either side.
     */
    public function scopeForTransaction(Builder $query, TransactionType $type): Builder
    {
        return $type === TransactionType::Both
            ? $query->where('transaction_type', TransactionType::Both->value)
            : $query->whereIn('transaction_type', [$type->value, TransactionType::Both->value]);
    }

    public function isPublished(): bool
    {
        return $this->status === PropertyStatus::Published;
    }

    public function isRentable(): bool
    {
        return $this->transaction_type->requiresRentalDetails();
    }

    public function propertyType()
    {
        return $this->belongsTo(PropertyType::class);
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function saleDetail(): HasOne
    {
        return $this->hasOne(PropertySaleDetail::class);
    }

    public function rentalDetail(): HasOne
    {
        return $this->hasOne(PropertyRentalDetail::class);
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
