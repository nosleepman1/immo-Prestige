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

// Private: personal notification stream. Laravel's Notifiable broadcasts on
// App.Models.User.{id} by default; only that user may listen, never an admin —
// a notification is addressed, not supervised.
Broadcast::channel('App.Models.User.{userId}', function (User $user, int $userId) {
    return $user->id === $userId;
});
