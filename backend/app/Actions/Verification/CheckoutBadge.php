<?php

namespace App\Actions\Verification;

use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use App\Exceptions\PaymentInitiationFailedException;
use App\Models\Agency;
use App\Models\Payment;
use App\Models\Setting;
use App\Payments\Contracts\PaymentGateway;
use Throwable;

class CheckoutBadge
{
    public function __construct(private PaymentGateway $gateway) {}

    /**
     * @return array{payment: Payment, redirect_url: string}
     */
    public function handle(Agency $agency): array
    {
        $price = Setting::integer('verification_badge_price', 10000);

        $payment = Payment::create([
            'agency_id' => $agency->id,
            'purpose' => PaymentPurpose::VerificationBadge,
            'amount' => $price,
            'status' => PaymentStatus::Pending,
        ]);

        try {
            $invoice = $this->gateway->createInvoice($payment, 'Badge vérifié Immo-Prestige');
        } catch (Throwable) {
            $payment->update(['status' => PaymentStatus::Failed]);

            throw new PaymentInitiationFailedException();
        }

        $payment->update(['invoice_token' => $invoice->token]);

        return ['payment' => $payment, 'redirect_url' => $invoice->redirectUrl];
    }
}
