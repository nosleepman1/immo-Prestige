<?php

namespace App\Http\Controllers;

use App\Actions\Rental\RecordCashPayment;
use App\Http\Resources\LeaseInstallmentResource;
use App\Models\Agency;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * The agency's ledger: who owes what, and recording the cash that comes in.
 */
class AgencyInstallmentController extends Controller
{
    /**
     * Ordered by due date so the oldest arrear leads the list — that is the one
     * worth a phone call.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $agency = Agency::whereBelongsTo($request->user())->firstOrFail();

        $installments = LeaseInstallment::query()
            ->whereIn('lease_id', $agency->leases()->select('id'))
            ->with('lease.tenant:id,name')
            ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->query('lease_id'), fn ($q, $v) => $q->where('lease_id', $v))
            ->when($request->query('month'), fn ($q, $v) => $q->whereYear('period_start', substr($v, 0, 4))
                ->whereMonth('period_start', substr($v, 5, 2)))
            ->when($request->boolean('late_only'), fn ($q) => $q->where('status', 'late'))
            ->orderBy('due_date')
            ->paginate($request->integer('per_page') ?: 30)
            ->withQueryString();

        return LeaseInstallmentResource::collection($installments);
    }

    /**
     * Rent handed over in cash. RG-L19: recorded under the name of the agent
     * doing it, at the moment they do it, and not editable afterwards.
     */
    public function recordCash(Request $request, Lease $lease, RecordCashPayment $record): JsonResponse
    {
        $this->authorize('reviewSignature', $lease);

        $validated = $request->validate([
            'installment_ids' => 'required|array|min:1',
            'installment_ids.*' => 'integer',
            'amount' => 'required|integer|min:1',
        ]);

        $payment = $record->handle(
            $lease,
            $request->user(),
            $validated['installment_ids'],
            $validated['amount'],
        );

        return response()->json([
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
            'recorded_by' => $request->user()->name,
            'recorded_at' => $payment->validated_at,
        ], 201);
    }

    /**
     * The move-in payment settled in cash — it activates the lease exactly as a
     * confirmed online payment would.
     */
    public function recordCashInitial(Request $request, Lease $lease, RecordCashPayment $record): JsonResponse
    {
        $this->authorize('reviewSignature', $lease);

        $payment = $record->initialPayment($lease, $request->user());

        return response()->json([
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
            'lease_status' => $lease->refresh()->status,
        ], 201);
    }
}
