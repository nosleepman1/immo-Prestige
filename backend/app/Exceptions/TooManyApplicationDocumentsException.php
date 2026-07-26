<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class TooManyApplicationDocumentsException extends Exception
{
    public function __construct(int $max)
    {
        parent::__construct("Un dossier ne peut pas dépasser {$max} pièces justificatives.");
    }

    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 422);
    }
}
