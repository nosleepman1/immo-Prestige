<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContractTemplate extends Model
{
    /** @use HasFactory<\Database\Factories\ContractTemplateFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agency_id',
        'name',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function clauses(): HasMany
    {
        return $this->hasMany(ContractClause::class)->orderBy('position');
    }
}
