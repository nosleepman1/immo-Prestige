<?php

namespace App\Enums;

enum PaymentPurpose: string
{
    case Subscription = 'subscription';
    case VerificationBadge = 'verification_badge';

    /**
     * The move-in payment: deposit plus the months paid in advance (RG-L13).
     * Its rent share is imputed onto the first instalments; the deposit share
     * stays unimputed, because a deposit is held, not earned.
     */
    case Deposit = 'deposit';

    /**
     * A tenant settling one or several monthly instalments.
     */
    case Rent = 'rent';

    /**
     * Paid by the tenant rather than by the agency — the two motives that flow
     * the other way round. `payments.agency_id` names the agency being paid,
     * not the payer.
     */
    public function isPaidByTenant(): bool
    {
        return in_array($this, [self::Deposit, self::Rent], true);
    }

    public function label(): string
    {
        return match ($this) {
            self::Subscription => 'Abonnement',
            self::VerificationBadge => 'Badge de vérification',
            self::Deposit => 'Versement initial (caution et avance)',
            self::Rent => 'Loyer',
        };
    }
}
