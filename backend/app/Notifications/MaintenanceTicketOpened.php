<?php

namespace App\Notifications;

use App\Models\MaintenanceTicket;

/**
 * To the agency. Not mailed: this is consulted in the work list, and mailing
 * every leak would train them to ignore the channel that also carries money.
 */
class MaintenanceTicketOpened extends RentalNotification
{
    public function __construct(public MaintenanceTicket $ticket) {}

    protected function key(): string
    {
        return 'maintenance.opened';
    }

    protected function title(): string
    {
        return 'Nouvel incident signalé';
    }

    /**
     * @return array<string, mixed>
     */
    protected function payload(): array
    {
        return [
            'ticket_id' => $this->ticket->id,
            'reference' => $this->ticket->reference,
            'lease_id' => $this->ticket->lease_id,
            'property_name' => $this->ticket->property?->name,
            'category' => $this->ticket->category->value,
            'priority' => $this->ticket->priority->value,
            'ticket_title' => $this->ticket->title,
        ];
    }
}
