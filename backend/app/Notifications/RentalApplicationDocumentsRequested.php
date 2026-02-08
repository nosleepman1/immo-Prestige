<?php

namespace App\Notifications;

use App\Models\RentalApplication;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To the candidate. Mailed: an action is expected from someone who, by
 * definition, is not watching the app right now.
 */
class RentalApplicationDocumentsRequested extends RentalNotification
{
    public function __construct(public RentalApplication $application) {}

    protected function key(): string
    {
        return 'rental_application.documents_requested';
    }

    protected function title(): string
    {
        return 'Des pièces complémentaires vous sont demandées';
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
            'rental_application_id' => $this->application->id,
            'property_id' => $this->application->property_id,
            'property_name' => $this->application->property?->name,
            'requested_documents' => $this->application->requested_documents,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pièces complémentaires demandées pour votre dossier')
            ->greeting('Bonjour,')
            ->line(sprintf(
                'L\'agence a besoin de pièces complémentaires pour instruire votre demande sur « %s ».',
                $this->application->property?->name ?? 'le bien concerné'
            ))
            ->line('Pièces demandées : '.$this->application->requested_documents)
            ->action('Compléter mon dossier', url('/rental-applications/'.$this->application->id))
            ->line('Votre dossier reste en attente tant que ces pièces ne sont pas fournies.');
    }
}
