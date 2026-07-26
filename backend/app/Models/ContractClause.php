<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContractClause extends Model
{
    /** @use HasFactory<\Database\Factories\ContractClauseFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'contract_template_id',
        'position',
        'title',
        'body',
        'is_required',
    ];

    protected $casts = [
        'position' => 'integer',
        'is_required' => 'boolean',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(ContractTemplate::class, 'contract_template_id');
    }
}
