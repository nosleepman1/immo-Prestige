<?php

namespace App\Exceptions;

class TooManyPropertyImagesException extends DomainException
{
    public int $status = 409;

    public string $errorCode = 'TOO_MANY_IMAGES';

    public function __construct(int $max)
    {
        parent::__construct("Une propriété ne peut avoir plus de {$max} images.");
    }
}
