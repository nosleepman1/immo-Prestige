<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    /**
     * Only a `user` account may cold-start a conversation toward an agency
     * (agencies reply within an existing conversation, they don't initiate).
     */
    public function create(User $user): bool
    {
        return ! $user->isAgency() && ! $user->isAdmin();
    }

    public function view(User $user, Conversation $conversation): bool
    {
        return $user->isAdmin() || $conversation->isParticipant($user);
    }
}
