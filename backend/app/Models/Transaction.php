<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    /** @use HasFactory<\Database\Factories\TransactionFactory> */
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'event',
        'external_ref',
        'signature_valid',
        'payload',
    ];

    protected $casts = [
        'signature_valid' => 'boolean',
        'payload' => 'array',
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
