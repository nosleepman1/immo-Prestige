<?php

namespace App\Actions\Maintenance;

use App\Exceptions\TicketNotOpenException;
use App\Models\Agency;
use App\Models\MaintenanceTicket;
use App\Models\MaintenanceTicketMessage;
use App\Models\User;
use App\Notifications\MaintenanceMessagePosted;
use Illuminate\Support\Facades\DB;

/**
 * A message on the ticket's own thread — deliberately separate from the
 * commercial conversation, so technical follow-up is not buried under a
 * negotiation.
 */
class PostTicketMessage
{
    /**
     * @throws TicketNotOpenException
     */
    public function handle(MaintenanceTicket $ticket, User $author, string $body): MaintenanceTicketMessage
    {
        if (! $ticket->status->isLive()) {
            throw new TicketNotOpenException();
        }

        $message = $ticket->messages()->create([
            'user_id' => $author->id,
            'body' => $body,
        ]);

        // Whoever did not write it gets told. Not mailed: already covered by
        // the live channel, and a mail per reply would be intrusive.
        DB::afterCommit(function () use ($ticket, $author, $message) {
            $recipient = $this->otherParty($ticket, $author);

            $recipient?->notify(new MaintenanceMessagePosted($ticket, $message));
        });

        return $message;
    }

    private function otherParty(MaintenanceTicket $ticket, User $author): ?User
    {
        $tenant = $ticket->lease?->tenant;

        if ($tenant && $tenant->id === $author->id) {
            $agencyId = $ticket->lease?->agency_id;

            return $agencyId ? Agency::whereKey($agencyId)->with('user')->first()?->user : null;
        }

        return $tenant;
    }
}
