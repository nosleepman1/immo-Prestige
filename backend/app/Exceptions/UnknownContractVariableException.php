<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class UnknownContractVariableException extends Exception
{
    /**
     * @param  array<int, string>  $unknown
     * @param  array<int, string>  $available
     */
    public function __construct(public readonly array $unknown, public readonly array $available)
    {
        parent::__construct(sprintf(
            'Variable inconnue dans une clause du contrat : %s. Variables disponibles : %s.',
            implode(', ', array_map(fn ($v) => '{{'.$v.'}}', $unknown)),
            implode(', ', array_map(fn ($v) => '{{'.$v.'}}', $available)),
        ));
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'unknown_variables' => $this->unknown,
            'available_variables' => $this->available,
        ], 422);
    }
}
