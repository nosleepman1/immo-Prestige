<?php

namespace App\Notifications;

use App\Models\LeaseInstallment;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * To the tenant, five days ahead. Mailed: preventing an arrear is worth more
 * than reporting one.
 */
class InstallmentDueSoon extends RentalNotification
{
    public function __construct(public LeaseInstallment $installment) {}

    protected function key(): string
    {
        return 'installment.due_soon';
    }

    protected function title(): string
    {
        return 'Votre loyer arrive à échéance';
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
            ->subject('Votre loyer arrive à échéance le '.$this->installment->due_date?->format('d/m/Y'))
            ->greeting('Bonjour,')
            ->line(sprintf(
                'Le loyer de la période du %s au %s, soit %s FCFA, est exigible le %s.',
                $this->installment->period_start?->format('d/m/Y') ?? '—',
                $this->installment->period_end?->format('d/m/Y') ?? '—',
                number_format($this->installment->remainingDue(), 0, ',', ' '),
                $this->installment->due_date?->format('d/m/Y') ?? '—'
            ))
            ->action('Régler maintenant', url('/leases/'.$this->installment->lease_id));
    }
}
