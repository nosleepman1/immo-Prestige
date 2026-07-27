<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceTicketMessage extends Model
{
    /** @use HasFactory<\Database\Factories\MaintenanceTicketMessageFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = ['maintenance_ticket_id', 'user_id', 'body'];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(MaintenanceTicket::class, 'maintenance_ticket_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
