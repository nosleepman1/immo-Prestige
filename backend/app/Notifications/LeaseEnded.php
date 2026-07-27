<?php

namespace App\Notifications;

use App\Models\Lease;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To both parties. Mailed: the end of a contractual relationship, with a
 * deposit still to settle between them.
 */
class LeaseEnded extends RentalNotification
{
    public function __construct(public Lease $lease) {}

    protected function key(): string
    {
        return 'lease.ended';
    }

    protected function title(): string
    {
        return 'Le bail est arrivé à son terme';
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
            'end_date' => $this->lease->end_date?->toDateString(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Bail '.$this->lease->reference.' — arrivé à son terme')
            ->greeting('Bonjour,')
            ->line(sprintf(
                'Le bail %s portant sur « %s » est arrivé à son terme le %s.',
                $this->lease->reference,
                $this->lease->property?->name ?? 'le bien concerné',
                $this->lease->end_date?->format('d/m/Y') ?? '—'
            ))
            ->line('Rapprochez-vous de votre agence pour l\'état des lieux de sortie et la restitution du dépôt de garantie.')
            ->action('Voir le bail', url('/leases/'.$this->lease->id));
    }
}
