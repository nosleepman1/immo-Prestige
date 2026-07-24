<?php

namespace App\Models;

use App\Enums\AgencyStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agency extends Model
{
    /** @use HasFactory<\Database\Factories\AgencyFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_name',
        'manager_name',
        'description',
        'address',
        'city',
        'activity_zone',
        'phone',
        'id_card',
        'status',
        'refusal_reason',
        'reviewed_by',
        'reviewed_at',
        'activated_at',
        'verified_until',
        'user_id',
    ];

    protected $casts = [
        'status' => AgencyStatus::class,
        'reviewed_at' => 'datetime',
        'activated_at' => 'datetime',
        'verified_until' => 'datetime',
    ];

    public function isVerified(): bool
    {
        return $this->verified_until?->isFuture() ?? false;
    }

    /**
     * Cascade soft-delete to owned properties and documents.
     */
    protected static function booted(): void
    {
        static::deleting(function (Agency $agency) {
            if (! $agency->isForceDeleting()) {
                $agency->properties()->get()->each->delete();
                $agency->documents()->get()->each->delete();
            }
        });
    }

    public function isAccepted(): bool
    {
        return $this->status === AgencyStatus::Accepted;
    }

    public function isReviewed(): bool
    {
        return $this->status !== AgencyStatus::Pending;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
    }

    public function documents()
    {
        return $this->hasMany(AgencyDocument::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function hasActiveSubscription(): bool
    {
        return (bool) $this->subscription()->first()?->isActive();
    }
}
