<?php

namespace App\Models;

use App\Enums\InstallmentStatus;
use App\Models\Concerns\HasYearlyReference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LeaseInstallment extends Model
{
    /** @use HasFactory<\Database\Factories\LeaseInstallmentFactory> */
    use HasFactory, HasYearlyReference;

    protected $fillable = [
        'lease_id',
        'reference',
        'period_start',
        'period_end',
        'due_date',
        'rent_amount',
        'charges_amount',
        'total_amount',
        'paid_amount',
        'status',
        'paid_at',
        'receipt_path',
    ];

    protected $casts = [
        'status' => InstallmentStatus::class,
        'period_start' => 'date',
        'period_end' => 'date',
        'due_date' => 'date',
        'rent_amount' => 'integer',
        'charges_amount' => 'integer',
        'total_amount' => 'integer',
        'paid_amount' => 'integer',
        'paid_at' => 'datetime',
    ];

    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class);
    }

    /**
     * The payments that settled this month, each with the share it contributed.
     */
    public function payments(): BelongsToMany
    {
        return $this->belongsToMany(Payment::class, 'installment_payment')
            ->withPivot('applied_amount')
            ->withTimestamps();
    }

    public function scopeOutstanding(Builder $query): Builder
    {
        return $query->whereIn('status', [
            InstallmentStatus::Pending->value,
            InstallmentStatus::PartiallyPaid->value,
            InstallmentStatus::Late->value,
        ]);
    }

    /**
     * What is still owed on this month. Never negative: RG-L20 forbids
     * imputing more than this, so a payment can never push it below zero.
     */
    public function remainingDue(): int
    {
        return max(0, $this->total_amount - $this->paid_amount);
    }

    public function isSettled(): bool
    {
        return $this->paid_amount >= $this->total_amount;
    }

    /**
     * Recomputes status and paid total from the imputations, which are the
     * source of truth. Called after every imputation rather than derived on
     * read, because the arrears screen reads these two columns on every row.
     */
    public function refreshSettlement(): void
    {
        $applied = (int) $this->payments()->sum('installment_payment.applied_amount');

        $status = match (true) {
            $applied >= $this->total_amount => InstallmentStatus::Paid,
            $applied > 0 => InstallmentStatus::PartiallyPaid,
            // An unpaid month past its due date goes back to Late, not to
            // Pending: the sweep already ruled on it.
            $this->due_date->isPast() => InstallmentStatus::Late,
            default => InstallmentStatus::Pending,
        };

        $this->update([
            'paid_amount' => $applied,
            'status' => $status,
            'paid_at' => $status === InstallmentStatus::Paid ? ($this->paid_at ?? now()) : null,
        ]);
    }

    public static function referencePrefix(): string
    {
        return 'QUIT';
    }
}
