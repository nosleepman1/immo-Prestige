<?php

namespace App\Notifications;

use App\Models\RentalApplication;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To the candidate. Mailed: decisive step of the journey.
 */
class RentalApplicationAccepted extends RentalNotification
{
    public function __construct(public RentalApplication $application) {}

    protected function key(): string
    {
        return 'rental_application.accepted';
    }

    protected function title(): string
    {
        return 'Votre demande de location est acceptée';
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
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre demande de location est acceptée')
            ->greeting('Bonne nouvelle,')
            ->line(sprintf(
                'Votre demande pour « %s » vient d\'être acceptée.',
                $this->application->property?->name ?? 'le bien concerné'
            ))
            ->line('L\'agence va maintenant préparer votre contrat de bail. Vous serez prévenu dès qu\'il sera disponible à la lecture.')
            ->action('Voir ma demande', url('/rental-applications/'.$this->application->id));
    }
}
