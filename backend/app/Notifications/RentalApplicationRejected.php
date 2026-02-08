<?php

namespace App\Notifications;

use App\Models\RentalApplication;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To the candidate. Mailed with the reason: information that is owed, and RG-L07
 * makes the reason mandatory precisely so this message is never empty.
 */
class RentalApplicationRejected extends RentalNotification
{
    public function __construct(public RentalApplication $application) {}

    protected function key(): string
    {
        return 'rental_application.rejected';
    }

    protected function title(): string
    {
        return 'Votre demande de location n\'a pas été retenue';
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
            'rejection_reason' => $this->application->rejection_reason,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre demande de location n\'a pas été retenue')
            ->greeting('Bonjour,')
            ->line(sprintf(
                'Votre demande pour « %s » n\'a pas été retenue.',
                $this->application->property?->name ?? 'le bien concerné'
            ))
            ->line('Motif indiqué par l\'agence : '.$this->application->rejection_reason)
            ->line('D\'autres biens correspondent peut-être à votre recherche.')
            ->action('Voir les biens disponibles', url('/properties'));
    }
}
