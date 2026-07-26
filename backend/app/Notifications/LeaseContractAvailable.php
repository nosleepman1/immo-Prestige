<?php

namespace App\Notifications;

use App\Models\Lease;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To the tenant. Mailed: a document to read and validate.
 */
class LeaseContractAvailable extends RentalNotification
{
    public function __construct(public Lease $lease) {}

    protected function key(): string
    {
        return 'lease.contract_available';
    }

    protected function title(): string
    {
        return 'Votre contrat de bail est disponible';
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
            ->subject('Votre contrat de bail '.$this->lease->reference.' est disponible')
            ->greeting('Bonjour,')
            ->line(sprintf(
                'L\'agence %s a établi votre contrat de bail pour « %s ».',
                $this->lease->agency?->company_name ?? 'concernée',
                $this->lease->property?->name ?? 'le bien concerné'
            ))
            ->line(sprintf(
                'Loyer mensuel : %s FCFA, charges comprises. Versement initial exigible : %s FCFA.',
                number_format($this->lease->monthlyTotal(), 0, ',', ' '),
                number_format($this->lease->initialPayment(), 0, ',', ' ')
            ))
            ->action('Lire et valider le contrat', url('/leases/'.$this->lease->id))
            ->line('Prenez le temps de lire les clauses avant de valider : ce sont elles qui vous engagent.');
    }
}
