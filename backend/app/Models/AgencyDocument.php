<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgencyDocument extends Model
{
    /** @use HasFactory<\Database\Factories\AgencyDocumentFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agency_id',
        'type',
        'path',
        'original_name',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }
}
