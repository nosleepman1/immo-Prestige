<?php

namespace App\Notifications;

use App\Models\Lease;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To the agency. Mailed: it unblocks the rest of the journey, and nobody is
 * watching a queue for it.
 */
class SignedContractUploaded extends RentalNotification
{
    public function __construct(public Lease $lease) {}

    protected function key(): string
    {
        return 'lease.signed_contract_uploaded';
    }

    protected function title(): string
    {
        return 'Un contrat signé a été téléversé';
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
            'tenant_name' => $this->lease->tenant?->name,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Contrat signé reçu — '.$this->lease->reference)
            ->greeting('Bonjour,')
            ->line(sprintf(
                '%s a téléversé le contrat signé du bail %s (« %s »).',
                $this->lease->tenant?->name ?? 'Le locataire',
                $this->lease->reference,
                $this->lease->property?->name ?? 'bien concerné'
            ))
            ->action('Contrôler le document', url('/agency/leases/'.$this->lease->id))
            ->line('Le paiement initial ne peut être demandé qu\'une fois ce document validé.');
    }
}
