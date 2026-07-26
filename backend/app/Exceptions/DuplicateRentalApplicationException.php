<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * RG-L05: one live application per candidate and property. Also raised when the
 * database's partial unique index rejects a concurrent double submit.
 */
class DuplicateRentalApplicationException extends Exception
{
    public function __construct()
    {
        parent::__construct('Vous avez déjà une demande en cours pour ce bien.');
    }

    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 409);
    }
}
