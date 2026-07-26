<?php

namespace App\Models;

use App\Enums\RentalDocumentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class RentalApplicationDocument extends Model
{
    /** @use HasFactory<\Database\Factories\RentalApplicationDocumentFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'rental_application_id',
        'type',
        'file_path',
        'original_name',
        'size_bytes',
        'mime_type',
    ];

    protected $casts = [
        'type' => RentalDocumentType::class,
        'size_bytes' => 'integer',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(RentalApplication::class, 'rental_application_id');
    }
}
