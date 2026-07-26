<?php

namespace App\Actions\Rental;

use App\Enums\PaymentMethod;
use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use App\Exceptions\PaymentInitiationFailedException;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use App\Models\Payment;
use App\Models\User;
use App\Payments\Contracts\PaymentGateway;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * The tenant settles one or several months in one go.
 *
 * The amount is computed from what is actually still owed on the chosen
 * instalments, never taken from the client: a figure supplied by the browser
 * is a figure someone can change.
 */
class CheckoutInstallments
{
    public function __construct(private readonly PaymentGateway $gateway) {}

    /**
     * @param  array<int, int>  $installmentIds
     * @return array{payment: Payment, redirect_url: string, amount: int}
     *
     * @throws PaymentInitiationFailedException
     */
    public function handle(Lease $lease, User $payer, array $installmentIds): array
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

        $amount = (int) $installments->sum(fn (LeaseInstallment $i) => $i->remainingDue());

        $payment = Payment::create([
            'agency_id' => $lease->agency_id,
            'lease_id' => $lease->id,
            'payer_user_id' => $payer->id,
            'purpose' => PaymentPurpose::Rent,
            'amount' => $amount,
            'status' => PaymentStatus::Pending,
            'method' => PaymentMethod::PayDunya,
        ]);

        // The selection is recorded now, at zero, so the IPN knows which months
        // this invoice was raised for. A tenant could otherwise pay while a
        // second payment lands on the same months, and the confirmation would
        // have no way to tell which ones it was meant to clear.
        $payment->installments()->attach(
            $installments->mapWithKeys(fn (LeaseInstallment $i) => [$i->id => ['applied_amount' => 0]])->all()
        );

        try {
            $label = $installments->count() === 1
                ? "Loyer {$installments->first()->period_start->format('m/Y')} — bail {$lease->reference}"
                : "Loyers ({$installments->count()} mois) — bail {$lease->reference}";

            $invoice = $this->gateway->createInvoice($payment, $label);
        } catch (Throwable) {
            $payment->update(['status' => PaymentStatus::Failed]);

            throw new PaymentInitiationFailedException();
        }

        $payment->update(['invoice_token' => $invoice->token]);

        return ['payment' => $payment, 'redirect_url' => $invoice->redirectUrl, 'amount' => $amount];
    }
}
