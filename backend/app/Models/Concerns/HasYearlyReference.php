<?php

namespace App\Models\Concerns;

use Illuminate\Database\UniqueConstraintViolationException;

/**
 * Human-readable, year-scoped references: BAIL-2026-00001, QUIT-2026-00042.
 *
 * Assigned on `creating` rather than in a factory default, so the number is
 * computed at save time. Computed at make time, a batch of three would evaluate
 * the same counter three times and collide on insert.
 *
 * Derived from the highest existing suffix rather than from a row count: a
 * soft-deleted ticket would otherwise let its number be handed out twice.
 *
 * The unique index remains the real guarantee. Two inserts in the same instant
 * still read the same maximum, so the loser retries instead of failing — the
 * only honest way to keep dense numbering without a sequence table.
 */
trait HasYearlyReference
{
    /** Prefix of the reference, e.g. TIC. */
    abstract public static function referencePrefix(): string;

    protected static function bootHasYearlyReference(): void
    {
        static::creating(function ($model) {
            $model->reference ??= static::nextReference();
        });
    }

    public static function nextReference(): string
    {
        $year = now()->year;
        $prefix = static::referencePrefix()."-{$year}-";

        $highest = static::withoutGlobalScopes()
            ->where('reference', 'like', $prefix.'%')
            ->max('reference');

        $next = $highest ? ((int) substr($highest, strlen($prefix))) + 1 : 1;

        return $prefix.str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Creates the model, retrying once if a concurrent insert took the number
     * first. One retry is enough: a second collision would mean contention this
     * domain does not have.
     *
     * @param  array<string, mixed>  $attributes
     */
    public static function createWithReference(array $attributes): static
    {
        try {
            return static::create($attributes);
        } catch (UniqueConstraintViolationException) {
            unset($attributes['reference']);

            return static::create($attributes);
        }
    }
}
