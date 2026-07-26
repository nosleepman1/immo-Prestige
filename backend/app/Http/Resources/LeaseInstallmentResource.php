<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaseInstallmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'period_start' => $this->period_start?->toDateString(),
            'period_end' => $this->period_end?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'rent_amount' => $this->rent_amount,
            'charges_amount' => $this->charges_amount,
            'total_amount' => $this->total_amount,
            'paid_amount' => $this->paid_amount,
            // Derived server-side: the amount a client offers to pay must come
            // from here, never from arithmetic done in a browser.
            'remaining_due' => $this->remainingDue(),
            'status' => $this->status,
            'status_label' => $this->status->label(),
            'paid_at' => $this->paid_at,
            'has_receipt' => $this->receipt_path !== null,
            'imputations' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($payment) => [
                'payment_id' => $payment->id,
                'applied_amount' => $payment->pivot->applied_amount,
                'method' => $payment->method,
                'validated_at' => $payment->validated_at,
                'recorded_by' => $payment->validator?->name,
            ])),
        ];
    }
}
