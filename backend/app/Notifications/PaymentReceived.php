<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To both parties. Mailed: it engages money, and the message stands as proof.
 */
class PaymentReceived extends RentalNotification
{
    public function __construct(public Payment $payment) {}

    protected function key(): string
    {
        return 'payment.received';
    }

    protected function title(): string
    {
        return 'Paiement enregistré';
    }

    protected function sendsMail(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    protected function payload(): array
    {
        return [
            'payment_id' => $this->payment->id,
            'lease_id' => $this->payment->lease_id,
            'lease_reference' => $this->payment->lease?->reference,
            'amount' => $this->payment->amount,
            'purpose' => $this->payment->purpose->value,
            'method' => $this->payment->method?->value,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Paiement enregistré — '.number_format($this->payment->amount, 0, ',', ' ').' FCFA')
            ->greeting('Bonjour,')
            ->line(sprintf(
                'Un paiement de %s FCFA a été enregistré pour le bail %s (%s).',
                number_format($this->payment->amount, 0, ',', ' '),
                $this->payment->lease?->reference ?? '—',
                strtolower($this->payment->purpose->label())
            ))
            ->line('Mode de règlement : '.($this->payment->method?->label() ?? '—'))
            ->action('Voir le détail', url('/leases/'.$this->payment->lease_id))
            ->line('Ce message vaut accusé de réception. Les quittances correspondantes sont disponibles depuis votre espace.');
    }
}
