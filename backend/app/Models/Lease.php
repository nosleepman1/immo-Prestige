<?php

namespace App\Models;

use App\Enums\LeasePeriodicity;
use App\Enums\LeaseStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lease extends Model
{
    /** @use HasFactory<\Database\Factories\LeaseFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference',
        'property_id',
        'agency_id',
        'tenant_user_id',
        'owner_id',
        'rental_application_id',
        'contract_template_id',
        'start_date',
        'end_date',
        'duration_months',
        'rent_amount',
        'charges_amount',
        'deposit_amount',
        'advance_months',
        'periodicity',
        'payment_day',
        'notice_period_days',
        'status',
        'generated_contract_path',
        'signed_contract_path',
        'signed_at',
        'signature_rejection_reason',
        'validated_by',
        'validated_at',
        'termination_date',
        'termination_reason',
    ];

    protected $casts = [
        'status' => LeaseStatus::class,
        'periodicity' => LeasePeriodicity::class,
        'start_date' => 'date',
        'end_date' => 'date',
        'termination_date' => 'date',
        'signed_at' => 'datetime',
        'validated_at' => 'datetime',
        'duration_months' => 'integer',
        'rent_amount' => 'integer',
        'charges_amount' => 'integer',
        'deposit_amount' => 'integer',
        'advance_months' => 'integer',
        'payment_day' => 'integer',
        'notice_period_days' => 'integer',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tenant_user_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(RentalApplication::class, 'rental_application_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ContractTemplate::class, 'contract_template_id');
    }

    public function installments()
    {
        return $this->hasMany(LeaseInstallment::class);
    }

    public function maintenanceTickets()
    {
        return $this->hasMany(MaintenanceTicket::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', LeaseStatus::Active->value);
    }

    /**
     * What the tenant owes every month.
     */
    public function monthlyTotal(): int
    {
        return $this->rent_amount + $this->charges_amount;
    }

    /**
     * RG-L13: deposit plus the months paid in advance. This is the amount the
     * lease waits on before it can become active.
     */
    public function initialPayment(): int
    {
        return $this->deposit_amount + ($this->monthlyTotal() * $this->advance_months);
    }

    /**
     * Sequential, year-scoped, human-quotable reference: BAIL-2026-00001.
     *
     * Derived from the count of leases created this year rather than from the
     * id, so a reference never leaks how many leases the whole platform holds.
     */
    public static function nextReference(): string
    {
        $year = now()->year;

        $count = static::withTrashed()
            ->whereYear('created_at', $year)
            ->count();

        return sprintf('BAIL-%d-%05d', $year, $count + 1);
    }
}
