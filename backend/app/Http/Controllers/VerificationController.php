<?php

namespace App\Http\Controllers;

use App\Actions\Verification\CheckoutBadge;
use App\Models\Agency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    /**
     * Start a PayDunya payment for the monthly verification badge. State only
     * advances via the IPN webhook.
     */
    public function checkout(Request $request, CheckoutBadge $checkoutBadge): JsonResponse
    {
        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        $result = $checkoutBadge->handle($agency);

        return response()->json([
            'data' => [
                'payment_id' => $result['payment']->id,
                'redirect_url' => $result['redirect_url'],
            ],
        ], 201);
    }
}
