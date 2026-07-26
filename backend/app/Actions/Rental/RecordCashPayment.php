<?php

namespace App\Actions\Rental;

use App\Enums\PaymentMethod;
use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The agency records rent handed over in cash.
 *
 * This is how most rent is paid in Dakar, so it is a first-class path rather
 * than a workaround. RG-L19: the receipt carries the name of the agent who took
 * the money and the moment they did, both written here and never editable
 * afterwards — a cash entry nobody can be tied to is an invitation.
 *
 * Unlike the online route there is no invoice and no confirmation step: the
 * money is already in the drawer, so the payment is created `paid`.
 */
class RecordCashPayment
{
    public function __construct(
        private readonly ApplyPaymentToInstallments $apply,
        private readonly NotifyPaymentReceived $notify,
        private readonly ActivateLease $activateLease,
    ) {}

    /**
     * @param  array<int, int>  $installmentIds
     */
    public function handle(Lease $lease, User $agent, array $installmentIds, int $amount): Payment
    {
        $installments = LeaseInstallment::where('lease_id', $lease->id)
            ->whereIn('id', $installmentIds)
            ->outstanding()
            ->orderBy('due_date')
            ->get();

        if ($installments->isEmpty()) {
            throw ValidationException::withMessages([
                'installment_ids' => 'Aucune échéance à régler parmi celles sélectionnées.',
            ]);
        }

        $payment = DB::transaction(function () use ($lease, $agent, $installments, $amount) {
            $payment = Payment::create([
                'agency_id' => $lease->agency_id,
                'lease_id' => $lease->id,
                'payer_user_id' => $lease->tenant_user_id,
                'purpose' => PaymentPurpose::Rent,
                'amount' => $amount,
                'status' => PaymentStatus::Paid,
                'method' => PaymentMethod::Cash,
                // No provider: nothing external took part in this.
                'provider' => null,
                // RG-L19.
                'validated_by' => $agent->id,
                'validated_at' => now(),
            ]);

            // RG-L20 lives in the imputation action: a figure typed by a human
            // is exactly where an excess would come from.
            $this->apply->handle($payment, $installments, $amount);

            return $payment;
        });

        $this->notify->handle($payment);

        return $payment;
    }

    /**
     * The move-in payment settled in cash. Same guarantees, and it activates
     * the lease exactly as a confirmed online payment would (RG-L14).
     */
    public function initialPayment(Lease $lease, User $agent): Payment
    {
        $payment = DB::transaction(function () use ($lease, $agent) {
            $payment = Payment::create([
                'agency_id' => $lease->agency_id,
                'lease_id' => $lease->id,
                'payer_user_id' => $lease->tenant_user_id,
                'purpose' => PaymentPurpose::Deposit,
                'amount' => $lease->initialPayment(),
                'status' => PaymentStatus::Paid,
                'method' => PaymentMethod::Cash,
                'provider' => null,
                'validated_by' => $agent->id,
                'validated_at' => now(),
            ]);

            $this->activateLease->handle($lease, $payment);

            return $payment;
        });

        $this->notify->handle($payment);

        return $payment;
    }
}
