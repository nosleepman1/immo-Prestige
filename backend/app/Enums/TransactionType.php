<?php

namespace App\Enums;

/**
 * What a property is offered for. Drives which specialisation row must exist:
 * Sale => sale details, Rent => rental details, Both => the two.
 */
enum TransactionType: string
{
    case Sale = 'sale';
    case Rent = 'rent';
    case Both = 'both';

    public function requiresSaleDetails(): bool
    {
        return $this !== self::Rent;
    }

    public function requiresRentalDetails(): bool
    {
        return $this !== self::Sale;
    }
}
