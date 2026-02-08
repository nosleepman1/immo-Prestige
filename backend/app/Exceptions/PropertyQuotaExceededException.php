<?php

namespace App\Exceptions;

class PropertyQuotaExceededException extends DomainException
{
    public int $status = 409;

    public string $errorCode = 'PROPERTY_QUOTA_EXCEEDED';

    public function __construct()
    {
        parent::__construct('Le quota de propriétés publiables de votre abonnement est atteint.');
    }
}
