<?php

namespace App\Models;

use App\Enums\RentalApplicationStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RentalApplication extends Model
{
    /** @use HasFactory<\Database\Factories\RentalApplicationFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'agency_id',
        'applicant_user_id',
        'status',
        'desired_start_date',
        'desired_duration_months',
        'message',
        'rejection_reason',
        'requested_documents',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'status' => RentalApplicationStatus::class,
        'desired_start_date' => 'date',
        'desired_duration_months' => 'integer',
        'reviewed_at' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applicant_user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(RentalApplicationDocument::class);
    }

    /**
     * Applications that still block a second one on the same property.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', RentalApplicationStatus::activeValues());
    }
}
