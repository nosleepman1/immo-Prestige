<?php

namespace App\Models;

use App\Enums\MaintenanceCategory;
use App\Enums\MaintenancePriority;
use App\Enums\MaintenanceStatus;
use App\Models\Concerns\HasYearlyReference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceTicket extends Model
{
    /** @use HasFactory<\Database\Factories\MaintenanceTicketFactory> */
    use HasFactory, HasYearlyReference, SoftDeletes;

    protected $fillable = [
        'reference',
        'lease_id',
        'property_id',
        'reported_by_user_id',
        'category',
        'priority',
        'title',
        'description',
        'status',
        'resolved_at',
        'resolution_note',
    ];

    protected $casts = [
        'category' => MaintenanceCategory::class,
        'priority' => MaintenancePriority::class,
        'status' => MaintenanceStatus::class,
        'resolved_at' => 'datetime',
    ];

    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by_user_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(MaintenanceTicketImage::class)->orderBy('position');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(MaintenanceTicketMessage::class)->oldest();
    }

    public function scopeLive(Builder $query): Builder
    {
        return $query->whereNotIn('status', [
            MaintenanceStatus::Closed->value,
            MaintenanceStatus::Rejected->value,
        ]);
    }

    public static function referencePrefix(): string
    {
        return 'TIC';
    }
}
