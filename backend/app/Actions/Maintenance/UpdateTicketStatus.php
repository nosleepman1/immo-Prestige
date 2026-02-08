<?php

namespace App\Actions\Maintenance;

use App\Enums\MaintenanceStatus;
use App\Exceptions\TicketNotOpenException;
use App\Models\MaintenanceTicket;
use App\Notifications\MaintenanceTicketUpdated;
use Illuminate\Support\Facades\DB;

/**
 * The agency moves the ticket along. Resolution carries a note: "résolu" alone
 * tells the tenant nothing about what was actually done.
 */
class UpdateTicketStatus
{
    /**
     * @throws TicketNotOpenException
     */
    public function handle(
        MaintenanceTicket $ticket,
        MaintenanceStatus $status,
        ?string $resolutionNote = null,
    ): MaintenanceTicket {
        if (! $ticket->status->isLive()) {
            throw new TicketNotOpenException();
        }

        $resolving = in_array($status, [MaintenanceStatus::Resolved, MaintenanceStatus::Closed], true);

        $ticket->update([
            'status' => $status,
            'resolution_note' => $resolutionNote ?? $ticket->resolution_note,
            'resolved_at' => $resolving ? ($ticket->resolved_at ?? now()) : null,
        ]);

        DB::afterCommit(function () use ($ticket) {
            $ticket->lease?->tenant?->notify(new MaintenanceTicketUpdated($ticket));
        });

        return $ticket->refresh();
    }
}
