<?php

namespace App\Exceptions;

class AgencyAlreadyReviewedException extends DomainException
{
    public int $status = 409;

    public string $errorCode = 'ALREADY_REVIEWED';

    public function __construct()
    {
        parent::__construct('Cette demande d\'agence a déjà été traitée.');
    }
}
