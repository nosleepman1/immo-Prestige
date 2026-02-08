<?php

namespace App\Exceptions;

class PasswordNotSetException extends DomainException
{
    public int $status = 403;

    public string $errorCode = 'PASSWORD_NOT_SET';

    public function __construct()
    {
        parent::__construct('Vous devez définir votre mot de passe avant de continuer.');
    }
}
