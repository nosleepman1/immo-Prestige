<?php

namespace App\Notifications;

use App\Models\MaintenanceTicket;
use App\Models\MaintenanceTicketMessage;

/**
 * To the other party. Not mailed: the live channel already covers it.
 */
class MaintenanceMessagePosted extends RentalNotification
{
    public function __construct(
        public MaintenanceTicket $ticket,
        public MaintenanceTicketMessage $message,
    ) {}

    protected function key(): string
    {
        return 'maintenance.message';
    }

    protected function title(): string
    {
        return 'Nouveau message sur un incident';
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
            'message_id' => $this->message->id,
            'excerpt' => mb_substr($this->message->body, 0, 120),
        ];
    }
}
