<?php

namespace App\Models;

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
        'purpose',
        'amount',
        'status',
        'provider',
        'invoice_token',
    ];

    protected $casts = [
        'purpose' => PaymentPurpose::class,
        'status' => PaymentStatus::class,
        'amount' => 'integer',
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

    public function isPaid(): bool
    {
        return $this->status === PaymentStatus::Paid;
    }
}
