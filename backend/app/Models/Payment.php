<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agency_id',
        'subscription_id',
        'plan_id',
        'lease_id',
        'payer_user_id',
        'purpose',
        'amount',
        'status',
        'provider',
        'method',
        'invoice_token',
        'validated_by',
        'validated_at',
    ];

    protected $casts = [
        'purpose' => PaymentPurpose::class,
        'status' => PaymentStatus::class,
        'method' => PaymentMethod::class,
        'amount' => 'integer',
        'validated_at' => 'datetime',
    ];

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function lease()
    {
        return $this->belongsTo(Lease::class);
    }

    /**
     * The tenant who paid. Null on the agency-to-platform motives, where the
     * agency itself is the payer.
     */
    public function payer()
    {
        return $this->belongsTo(User::class, 'payer_user_id');
    }

    /**
     * The agent who confirmed a cash receipt (RG-L19).
     */
    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    /**
     * The instalments this payment settled, each with the share it contributed.
     */
    public function installments()
    {
        return $this->belongsToMany(LeaseInstallment::class, 'installment_payment')
            ->withPivot('applied_amount')
            ->withTimestamps();
    }

    public function isPaid(): bool
    {
        return $this->status === PaymentStatus::Paid;
    }

    /**
     * How much of this payment has been imputed onto instalments.
     */
    public function appliedAmount(): int
    {
        return (int) $this->installments()->sum('installment_payment.applied_amount');
    }

    /**
     * The share still to be imputed. On a move-in payment this settles at the
     * deposit, which is held rather than earned and is therefore never imputed
     * onto a month.
     */
    public function unappliedAmount(): int
    {
        return max(0, $this->amount - $this->appliedAmount());
    }
}
