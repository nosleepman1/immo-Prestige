<?php

namespace App\Http\Controllers;

use App\Actions\Rental\CheckoutInitialPayment;
use App\Actions\Rental\CheckoutInstallments;
use App\Actions\Rental\RenderInstallmentReceipt;
use App\Http\Resources\LeaseInstallmentResource;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * The tenant's ledger: what is owed, and how to settle it.
 */
class LeaseInstallmentController extends Controller
{
    public function index(Lease $lease): AnonymousResourceCollection
    {
        $this->authorize('view', $lease);

        return LeaseInstallmentResource::collection(
            $lease->installments()->with('payments.validator')->orderBy('due_date')->get()
        );
    }

    /**
     * The move-in payment, opening the lease (RG-L13).
     */
    public function checkoutInitial(
        Request $request,
        Lease $lease,
        CheckoutInitialPayment $checkout,
    ): JsonResponse {
        $this->authorize('validateTerms', $lease);

        $result = $checkout->handle($lease, $request->user());

        return response()->json([
            'redirect_url' => $result['redirect_url'],
            'amount' => $result['payment']->amount,
        ], 201);
    }

    /**
     * One or several months in one go. The amount is never taken from the
     * request: it is recomputed from what the chosen months still owe.
     */
    public function checkout(Request $request, Lease $lease, CheckoutInstallments $checkout): JsonResponse
    {
        $this->authorize('validateTerms', $lease);

        $validated = $request->validate([
            'installment_ids' => 'required|array|min:1',
            'installment_ids.*' => 'integer',
        ]);

        $result = $checkout->handle($lease, $request->user(), $validated['installment_ids']);

        return response()->json([
            'redirect_url' => $result['redirect_url'],
            'amount' => $result['amount'],
        ], 201);
    }

    /**
     * The receipt for a settled month. Streamed behind the policy — it names
     * both parties and the sum that changed hands.
     */
    public function receipt(LeaseInstallment $installment, RenderInstallmentReceipt $render): StreamedResponse
    {
        $this->authorize('downloadReceipt', $installment);

        $path = $render->handle($installment);

        abort_unless(Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->download($path, "quittance-{$installment->reference}.pdf");
    }
}
