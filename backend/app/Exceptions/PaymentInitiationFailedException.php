<?php

namespace App\Exceptions;

class PaymentInitiationFailedException extends DomainException
{
    public int $status = 502;

    public string $errorCode = 'PAYMENT_INITIATION_FAILED';

    public function __construct()
    {
        parent::__construct('Le fournisseur de paiement est indisponible. Réessayez plus tard.');
    }
}
