<?php

namespace App\Exceptions;

class AgencyNotRefusedException extends DomainException
{
    public int $status = 409;

    public string $errorCode = 'AGENCY_NOT_REFUSED';

    public function __construct()
    {
        parent::__construct('Seule une demande refusée peut être redéposée.');
    }
}
