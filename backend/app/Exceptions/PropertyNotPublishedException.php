<?php

namespace App\Exceptions;

class PropertyNotPublishedException extends DomainException
{
    public int $status = 422;

    public string $errorCode = 'PROPERTY_NOT_PUBLISHED';

    public function __construct()
    {
        parent::__construct('Seule une propriété publiée peut être partagée dans le fil.');
    }
}
