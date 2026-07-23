<?php

namespace App\Http\Controllers;

use App\Actions\Subscription\ProcessPaymentIpn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayDunyaWebhookController extends Controller
{
    /**
     * PayDunya IPN endpoint. Public (no auth) but authenticated by signature
     * inside the action. Always answers 200 so the provider stops retrying;
     * authenticity and idempotency are enforced in ProcessPaymentIpn.
     */
    public function handle(Request $request, ProcessPaymentIpn $process): JsonResponse
    {
        // PayDunya nests the invoice under `data`; the fake posts it flat.
        $payload = $request->input('data', $request->all());

        $process->handle($payload);

        return response()->json(['received' => true]);
    }
}
