<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceTicketImage extends Model
{
    /** @use HasFactory<\Database\Factories\MaintenanceTicketImageFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = ['maintenance_ticket_id', 'image_path', 'position'];

    protected $casts = ['position' => 'integer'];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(MaintenanceTicket::class, 'maintenance_ticket_id');
    }
}
