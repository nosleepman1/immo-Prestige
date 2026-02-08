<?php

namespace App\Actions\Messaging;

use App\Models\Agency;
use App\Models\Conversation;
use App\Models\Property;
use App\Models\User;

/**
 * A client reaches out to an agency, optionally about a specific property.
 * Idempotent: reopens the existing conversation for the same triplet instead
 * of creating a duplicate (unique constraint backs this at the DB level too).
 */
class StartConversation
{
    public function handle(User $client, Agency $agency, ?Property $property): Conversation
    {
        return Conversation::firstOrCreate([
            'client_id' => $client->id,
            'agency_id' => $agency->id,
            'property_id' => $property?->id,
        ]);
    }
}
