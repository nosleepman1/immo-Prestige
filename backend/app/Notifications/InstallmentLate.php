<?php

namespace App\Notifications;

use App\Models\LeaseInstallment;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To the tenant. Mailed: it engages money. Sent once, when the instalment
 * crosses its due date — repeated chasing is out of scope.
 */
class InstallmentLate extends RentalNotification
{
    public function __construct(public LeaseInstallment $installment) {}

    protected function key(): string
    {
        return 'installment.late';
    }

    protected function title(): string
    {
        return 'Loyer en retard';
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
            'installment_id' => $this->installment->id,
            'lease_id' => $this->installment->lease_id,
            'due_date' => $this->installment->due_date?->toDateString(),
            'remaining_due' => $this->installment->remainingDue(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Loyer en retard — '.number_format($this->installment->remainingDue(), 0, ',', ' ').' FCFA')
            ->greeting('Bonjour,')
            ->line(sprintf(
                'Le loyer de la période du %s au %s, échu le %s, reste dû à hauteur de %s FCFA.',
                $this->installment->period_start?->format('d/m/Y') ?? '—',
                $this->installment->period_end?->format('d/m/Y') ?? '—',
                $this->installment->due_date?->format('d/m/Y') ?? '—',
                number_format($this->installment->remainingDue(), 0, ',', ' ')
            ))
            ->action('Régulariser', url('/leases/'.$this->installment->lease_id))
            ->line('Si le règlement a déjà été effectué en espèces, signalez-le à votre agence.');
    }
}
