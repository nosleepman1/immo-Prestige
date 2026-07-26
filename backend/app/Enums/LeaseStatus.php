<?php

namespace App\Enums;

/**
 * Lifecycle of a lease, from the generated draft to its end.
 *
 * The order matters: each state names precisely who the platform is waiting
 * for. `pending_validation` waits on the tenant reading the terms,
 * `pending_signature` on the paper coming back scanned, `pending_payment` on
 * the deposit and advance clearing.
 */
enum LeaseStatus: string
{
    case Draft = 'draft';
    case PendingValidation = 'pending_validation';
    case PendingSignature = 'pending_signature';
    case PendingPayment = 'pending_payment';
    case Active = 'active';
    case Terminated = 'terminated';
    case Expired = 'expired';
    case Cancelled = 'cancelled';

    /**
     * A lease still on its way to activation.
     */
    public function isPending(): bool
    {
        return in_array($this, [
            self::Draft,
            self::PendingValidation,
            self::PendingSignature,
            self::PendingPayment,
        ], true);
    }

    /**
     * A lease whose story is over; nothing may be done to it any more.
     */
    public function isClosed(): bool
    {
        return in_array($this, [self::Terminated, self::Expired, self::Cancelled], true);
    }

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Brouillon',
            self::PendingValidation => 'En attente de validation du locataire',
            self::PendingSignature => 'En attente du contrat signé',
            self::PendingPayment => 'En attente du paiement initial',
            self::Active => 'Actif',
            self::Terminated => 'Résilié',
            self::Expired => 'Expiré',
            self::Cancelled => 'Annulé',
        };
    }
}
