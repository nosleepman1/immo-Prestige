<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    /** @use HasFactory<\Database\Factories\SubscriptionFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agency_id',
        'plan_id',
        'status',
        'price_snapshot',
        'quota_snapshot',
        'trial_ends_at',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'status' => SubscriptionStatus::class,
        'price_snapshot' => 'integer',
        'quota_snapshot' => 'array',
        'trial_ends_at' => 'datetime',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Active if trialing before the trial end, or active before the paid end.
     */
    public function isActive(): bool
    {
        return match ($this->status) {
            SubscriptionStatus::Trialing => $this->trial_ends_at?->isFuture() ?? false,
            SubscriptionStatus::Active => $this->ends_at?->isFuture() ?? false,
            default => false,
        };
    }
}
