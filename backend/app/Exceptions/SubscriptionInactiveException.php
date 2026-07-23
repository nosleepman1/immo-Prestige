<?php

namespace App\Exceptions;

class SubscriptionInactiveException extends DomainException
{
    public int $status = 402;

    public string $errorCode = 'SUBSCRIPTION_INACTIVE';

    public function __construct()
    {
        parent::__construct('Votre abonnement est inactif ou expiré.');
    }
}
