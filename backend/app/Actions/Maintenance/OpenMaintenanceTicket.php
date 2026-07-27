<?php

namespace App\Actions\Maintenance;

use App\Enums\MaintenanceStatus;
use App\Models\Lease;
use App\Models\MaintenanceTicket;
use App\Models\User;
use App\Notifications\MaintenanceTicketOpened;
use Illuminate\Support\Facades\DB;

class OpenMaintenanceTicket
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Lease $lease, User $reporter, array $data): MaintenanceTicket
    {
        $ticket = MaintenanceTicket::create([
            ...$data,
            'reference' => MaintenanceTicket::nextReference(),
            'lease_id' => $lease->id,
            // Denormalised from the lease: the agency's queue groups by
            // building, and a lease never changes property.
            'property_id' => $lease->property_id,
            'reported_by_user_id' => $reporter->id,
            'status' => MaintenanceStatus::Open,
        ]);

        // Not mailed: the agency reads its work list. Mailing every leak would
        // train them to ignore the channel that carries the money.
        DB::afterCommit(function () use ($ticket, $lease) {
            $lease->agency()->with('user')->first()?->user
                ?->notify(new MaintenanceTicketOpened($ticket->load('property')));
        });

        return $ticket;
    }
}
