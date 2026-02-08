<?php

namespace App\Exceptions;

use App\Enums\LeaseStatus;
use Exception;
use Illuminate\Http\JsonResponse;

/**
 * RG-L24: a forbidden transition says what it expected and what it found. A
 * silent no-op here would leave an agency convinced a lease was activated.
 */
class LeaseTransitionException extends Exception
{
    /**
     * @param  array<int, LeaseStatus>  $expected
     */
    public function __construct(string $action, LeaseStatus $actual, array $expected)
    {
        parent::__construct(sprintf(
            'Impossible de %s : le bail est « %s », alors que cette opération attend %s.',
            $action,
            $actual->label(),
            implode(' ou ', array_map(fn (LeaseStatus $s) => '« '.$s->label().' »', $expected)),
        ));
    }

    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 409);
    }
}
