<?php

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Private: only a conversation's participants (or an admin) may listen.
// Authorization reuses ConversationPolicy — no duplicated ownership logic.
Broadcast::channel('conversation.{conversationId}', function (User $user, int $conversationId) {
    $conversation = Conversation::find($conversationId);

    return $conversation && $user->can('view', $conversation);
});

// Public: post like counts carry no user identity, so no auth callback needed
// beyond registering the channel name (posts.{postId}) client-side.
