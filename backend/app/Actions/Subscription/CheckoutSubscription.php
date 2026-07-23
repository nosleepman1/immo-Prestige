<?php

namespace App\Actions\Subscription;

use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use App\Models\Agency;
use App\Models\Payment;
use App\Models\Plan;
use App\Payments\Contracts\PaymentGateway;

class CheckoutSubscription
{
    public function __construct(private PaymentGateway $gateway) {}

    /**
     * Creates a pending payment and a provider invoice; returns the redirect URL.
     * State only advances via the IPN webhook, never here.
     *
     * @return array{payment: Payment, redirect_url: string}
     */
    public function handle(Agency $agency, Plan $plan): array
    {
        $payment = Payment::create([
            'agency_id' => $agency->id,
            'plan_id' => $plan->id,
            'purpose' => PaymentPurpose::Subscription,
            'amount' => $plan->price,
            'status' => PaymentStatus::Pending,
        ]);

        $invoice = $this->gateway->createInvoice($payment, "Abonnement {$plan->name}");

        $payment->update(['invoice_token' => $invoice->token]);

        return ['payment' => $payment, 'redirect_url' => $invoice->redirectUrl];
    }
}
