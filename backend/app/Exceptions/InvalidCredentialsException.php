<?php

namespace App\Exceptions;

class InvalidCredentialsException extends DomainException
{
    public int $status = 401;

    public string $errorCode = 'INVALID_CREDENTIALS';

    public function __construct()
    {
        parent::__construct('Adresse e-mail ou mot de passe incorrect.');
    }
}
