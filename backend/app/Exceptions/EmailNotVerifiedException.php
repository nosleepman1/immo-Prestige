<?php

namespace App\Exceptions;

class EmailNotVerifiedException extends DomainException
{
    public int $status = 403;

    public string $errorCode = 'EMAIL_NOT_VERIFIED';

    public function __construct()
    {
        parent::__construct('Votre adresse e-mail n\'est pas encore vérifiée.');
    }
}
