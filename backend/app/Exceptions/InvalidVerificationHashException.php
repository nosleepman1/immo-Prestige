<?php

namespace App\Exceptions;

class InvalidVerificationHashException extends DomainException
{
    public int $status = 400;

    public string $errorCode = 'INVALID_HASH';

    public function __construct()
    {
        parent::__construct('Lien de vérification invalide.');
    }
}
