<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Owner extends Model
{
    /** @use HasFactory<\Database\Factories\OwnerFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agency_id',
        'user_id',
        'last_name',
        'first_name',
        'phone',
        'email',
        'address',
        'id_document_number',
        'notes',
    ];

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * The account through which the owner follows their properties, when one
     * has been linked. Null for an owner the agency simply keeps on file.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function fullName(): string
    {
        return trim(($this->first_name ?? '').' '.$this->last_name);
    }
}
