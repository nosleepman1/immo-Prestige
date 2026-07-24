<?php

namespace App\Exceptions;

class PropertyAlreadyPostedException extends DomainException
{
    public int $status = 409;

    public string $errorCode = 'PROPERTY_ALREADY_POSTED';

    public function __construct()
    {
        parent::__construct('Cette propriété a déjà été publiée dans le fil.');
    }
}
