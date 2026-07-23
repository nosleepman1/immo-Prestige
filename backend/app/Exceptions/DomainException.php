<?php

namespace App\Exceptions;

use Exception;

/**
 * Base class for business/domain exceptions.
 *
 * Each concrete exception carries the HTTP status and a stable string code
 * that the API exposes in the error envelope. Rendering is centralised in
 * bootstrap/app.php — subclasses only declare status + code.
 */
abstract class DomainException extends Exception
{
    /** HTTP status code returned to the client. */
    public int $status = 409;

    /** Stable machine-readable error code (SCREAMING_SNAKE_CASE). */
    public string $errorCode = 'DOMAIN_ERROR';
}
