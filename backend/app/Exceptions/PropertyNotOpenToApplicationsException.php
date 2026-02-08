<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * RG-L04: only a published, available rental property accepts an application.
 */
class PropertyNotOpenToApplicationsException extends Exception
{
    public function __construct(string $reason)
    {
        parent::__construct("Ce bien n'accepte pas de demande de location : {$reason}.");
    }

    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 422);
    }
}
