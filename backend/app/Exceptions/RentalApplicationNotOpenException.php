<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * A decided application (accepted, rejected, cancelled) is final: it cannot be
 * instructed again, nor completed with new documents.
 */
class RentalApplicationNotOpenException extends Exception
{
    public function __construct(string $action = 'instruite')
    {
        parent::__construct("Cette demande est déjà traitée et ne peut plus être {$action}.");
    }

    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 409);
    }
}
