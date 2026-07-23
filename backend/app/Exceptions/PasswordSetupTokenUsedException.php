<?php

namespace App\Exceptions;

class PasswordSetupTokenUsedException extends DomainException
{
    public int $status = 410;

    public string $errorCode = 'TOKEN_ALREADY_USED';

    public function __construct()
    {
        parent::__construct('Ce lien a déjà été utilisé.');
    }
}
