<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * RG-L20: an imputation may never exceed what is still owed on the instalments
 * it targets. Overpaying is not a favour to anyone — it makes the ledger lie,
 * and the excess has no month to belong to.
 */
class ExcessiveImputationException extends Exception
{
    public function __construct(public readonly int $offered, public readonly int $due)
    {
        parent::__construct(sprintf(
            'Le montant imputé (%s FCFA) dépasse le reste dû sur les échéances visées (%s FCFA).',
            number_format($offered, 0, ',', ' '),
            number_format($due, 0, ',', ' '),
        ));
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'offered' => $this->offered,
            'due' => $this->due,
        ], 422);
    }
}
