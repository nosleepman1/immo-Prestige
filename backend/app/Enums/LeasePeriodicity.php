<?php

namespace App\Enums;

/**
 * How often the tenant is asked to settle.
 *
 * Distinct from how instalments are generated: RG-L16 generates them monthly
 * whatever the periodicity, so a quarterly payer settles three monthly
 * instalments at once rather than owing one opaque quarterly sum.
 */
enum LeasePeriodicity: string
{
    case Monthly = 'monthly';
    case Quarterly = 'quarterly';
    case Biannual = 'biannual';
    case Annual = 'annual';

    /**
     * Number of monthly instalments settled in one payment cycle.
     */
    public function months(): int
    {
        return match ($this) {
            self::Monthly => 1,
            self::Quarterly => 3,
            self::Biannual => 6,
            self::Annual => 12,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Monthly => 'Mensuelle',
            self::Quarterly => 'Trimestrielle',
            self::Biannual => 'Semestrielle',
            self::Annual => 'Annuelle',
        };
    }
}
