<?php

namespace App\Notifications;

use App\Models\MaintenanceTicket;

/**
 * To the tenant. Not mailed: routine follow-up, and a mail on every status
 * change would be intrusive on someone already living with the problem.
 */
class MaintenanceTicketUpdated extends RentalNotification
{
    public function __construct(public MaintenanceTicket $ticket) {}

    protected function key(): string
    {
        return 'maintenance.updated';
    }

    protected function title(): string
    {
        return 'Votre incident a été mis à jour';
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
            'status' => $this->ticket->status->value,
            'status_label' => $this->ticket->status->label(),
            'resolution_note' => $this->ticket->resolution_note,
        ];
    }
}
