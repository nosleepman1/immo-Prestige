<?php

namespace App\Notifications;

use App\Models\Lease;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To both parties. Mailed: the lease is now running, which is the moment the
 * whole journey was heading for.
 */
class LeaseActivated extends RentalNotification
{
    public function __construct(public Lease $lease) {}

    protected function key(): string
    {
        return 'lease.activated';
    }

    protected function title(): string
    {
        return 'Le bail est actif';
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
            'start_date' => $this->lease->start_date?->toDateString(),
            'end_date' => $this->lease->end_date?->toDateString(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Bail '.$this->lease->reference.' — actif')
            ->greeting('Bonjour,')
            ->line(sprintf(
                'Le versement initial est encaissé : le bail %s portant sur « %s » est désormais actif.',
                $this->lease->reference,
                $this->lease->property?->name ?? 'le bien concerné'
            ))
            ->line(sprintf(
                'Il court du %s au %s. Le loyer est exigible le %d de chaque mois.',
                $this->lease->start_date?->format('d/m/Y') ?? '—',
                $this->lease->end_date?->format('d/m/Y') ?? '—',
                $this->lease->payment_day
            ))
            ->action('Voir le bail', url('/leases/'.$this->lease->id));
    }
}
