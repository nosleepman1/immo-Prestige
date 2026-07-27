<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * A closed or rejected ticket is finished: nothing more is added to it. Re-open
 * the conversation by filing a new ticket, so the history of what was actually
 * done stays readable.
 */
class TicketNotOpenException extends Exception
{
    public function __construct()
    {
        parent::__construct('Ce ticket est clos : ouvrez-en un nouveau si le problème persiste.');
    }

    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 409);
    }
}
