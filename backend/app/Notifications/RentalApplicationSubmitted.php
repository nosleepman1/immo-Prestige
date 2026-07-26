<?php

namespace App\Notifications;

use App\Models\RentalApplication;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To the agency. Mailed: an application left unattended loses a client.
 */
class RentalApplicationSubmitted extends RentalNotification
{
    public function __construct(public RentalApplication $application) {}

    protected function key(): string
    {
        return 'rental_application.submitted';
    }

    protected function title(): string
    {
        return 'Nouvelle demande de location';
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
            'applicant_name' => $this->application->applicant?->name,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle demande de location — '.$this->application->property?->name)
            ->greeting('Bonjour,')
            ->line(sprintf(
                '%s a déposé une demande de location pour « %s ».',
                $this->application->applicant?->name ?? 'Un candidat',
                $this->application->property?->name ?? 'un de vos biens'
            ))
            ->line(sprintf(
                'Entrée souhaitée le %s, pour %d mois.',
                $this->application->desired_start_date?->format('d/m/Y') ?? '—',
                $this->application->desired_duration_months
            ))
            ->action('Instruire la demande', url('/agency/rental-applications/'.$this->application->id))
            ->line('Un dossier traité rapidement est un client qui ne va pas voir ailleurs.');
    }
}
