<?php

namespace App\Notifications;

use App\Models\Lease;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To the tenant. Mailed: it opens the payment stage.
 */
class LeaseSignatureValidated extends RentalNotification
{
    public function __construct(public Lease $lease) {}

    protected function key(): string
    {
        return 'lease.signature_validated';
    }

    protected function title(): string
    {
        return 'Votre contrat signé est validé';
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
            'initial_payment' => $this->lease->initialPayment(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Contrat validé — il reste le versement initial')
            ->greeting('Bonne nouvelle,')
            ->line(sprintf(
                'L\'agence a validé votre contrat signé pour « %s ».',
                $this->lease->property?->name ?? 'le bien concerné'
            ))
            ->line(sprintf(
                'Versement initial à régler : %s FCFA (dépôt de garantie et %d mois d\'avance).',
                number_format($this->lease->initialPayment(), 0, ',', ' '),
                $this->lease->advance_months
            ))
            ->action('Régler le versement initial', url('/leases/'.$this->lease->id))
            ->line('Votre bail deviendra actif dès l\'encaissement confirmé.');
    }
}
