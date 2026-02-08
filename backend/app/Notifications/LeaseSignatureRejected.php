<?php

namespace App\Notifications;

use App\Models\Lease;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To the tenant. Mailed: a corrective action is expected from them.
 */
class LeaseSignatureRejected extends RentalNotification
{
    public function __construct(public Lease $lease) {}

    protected function key(): string
    {
        return 'lease.signature_rejected';
    }

    protected function title(): string
    {
        return 'Votre contrat signé doit être renvoyé';
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
            'lease_id' => $this->lease->id,
            'lease_reference' => $this->lease->reference,
            'property_name' => $this->lease->property?->name,
            'reason' => $this->lease->signature_rejection_reason,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre contrat signé doit être renvoyé')
            ->greeting('Bonjour,')
            ->line(sprintf(
                'L\'agence n\'a pas pu retenir le contrat signé que vous avez envoyé pour « %s ».',
                $this->lease->property?->name ?? 'le bien concerné'
            ))
            ->line('Motif : '.$this->lease->signature_rejection_reason)
            ->action('Renvoyer le contrat signé', url('/leases/'.$this->lease->id))
            ->line('Votre bail reste réservé le temps de cette régularisation.');
    }
}
