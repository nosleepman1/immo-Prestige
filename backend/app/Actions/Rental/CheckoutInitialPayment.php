<?php

namespace App\Actions\Rental;

use App\Enums\LeaseStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use App\Exceptions\LeaseTransitionException;
use App\Exceptions\PaymentInitiationFailedException;
use App\Models\Lease;
use App\Models\Payment;
use App\Models\User;
use App\Payments\Contracts\PaymentGateway;
use Throwable;

/**
 * Opens the move-in payment: deposit plus the months paid in advance (RG-L13).
 *
 * Creates a pending payment and a provider invoice, and returns the redirect
 * URL. Nothing advances here — the lease becomes active only once the IPN
 * confirms the money arrived (RG-L14).
 */
class CheckoutInitialPayment
{
    public function __construct(private readonly PaymentGateway $gateway) {}

    /**
     * @return array{payment: Payment, redirect_url: string}
     *
     * @throws LeaseTransitionException|PaymentInitiationFailedException
     */
    public function handle(Lease $lease, User $payer): array
    {
        if ($lease->status !== LeaseStatus::PendingPayment) {
            throw new LeaseTransitionException(
                'régler le versement initial',
                $lease->status,
                [LeaseStatus::PendingPayment],
            );
        }

        $payment = Payment::create([
            // The agency being paid, never the payer — see payer_user_id.
            'agency_id' => $lease->agency_id,
            'lease_id' => $lease->id,
            'payer_user_id' => $payer->id,
            'purpose' => PaymentPurpose::Deposit,
            'amount' => $lease->initialPayment(),
            'status' => PaymentStatus::Pending,
            'method' => PaymentMethod::PayDunya,
        ]);

        try {
            $invoice = $this->gateway->createInvoice(
                $payment,
                "Versement initial — bail {$lease->reference}"
            );
        } catch (Throwable) {
            $payment->update(['status' => PaymentStatus::Failed]);

            throw new PaymentInitiationFailedException();
        }

        $payment->update(['invoice_token' => $invoice->token]);

        return ['payment' => $payment, 'redirect_url' => $invoice->redirectUrl];
    }
}
