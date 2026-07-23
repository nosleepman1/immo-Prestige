<?php

namespace App\Exceptions;

class InvalidPasswordSetupTokenException extends DomainException
{
    public int $status = 422;

    public string $errorCode = 'INVALID_SETUP_TOKEN';

    public function __construct()
    {
        parent::__construct('Lien de définition du mot de passe invalide.');
    }
}
