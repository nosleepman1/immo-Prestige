<?php

namespace App\Exceptions;

class IncompletePropertyListingException extends DomainException
{
    public int $status = 422;

    public string $errorCode = 'INCOMPLETE_LISTING';

    public function __construct(string $reason)
    {
        parent::__construct("La fiche est incomplète pour être publiée : {$reason}.");
    }
}
