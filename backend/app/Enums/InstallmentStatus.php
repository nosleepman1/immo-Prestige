<?php

namespace App\Enums;

/**
 * State of a single monthly instalment.
 *
 * `Late` is not a separate truth from `Pending` or `PartiallyPaid` — it is one
 * of them past its due date. Keeping it as a state rather than deriving it lets
 * the agency's arrears list be an indexed read instead of a full scan compared
 * against today.
 */
enum InstallmentStatus: string
{
    case Pending = 'pending';
    case PartiallyPaid = 'partially_paid';
    case Paid = 'paid';
    case Late = 'late';
    case Cancelled = 'cancelled';

    /**
     * Still owed something.
     */
    public function isOutstanding(): bool
    {
        return in_array($this, [self::Pending, self::PartiallyPaid, self::Late], true);
    }

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Attendue',
            self::PartiallyPaid => 'Partiellement réglée',
            self::Paid => 'Réglée',
            self::Late => 'En retard',
            self::Cancelled => 'Annulée',
        };
    }
}
