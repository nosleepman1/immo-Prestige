<?php

namespace App\Exceptions;

class PasswordSetupTokenExpiredException extends DomainException
{
    public int $status = 410;

    public string $errorCode = 'TOKEN_EXPIRED';

    public function __construct()
    {
        parent::__construct('Ce lien a expiré. Demandez-en un nouveau.');
    }
}
