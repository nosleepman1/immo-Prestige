<?php

namespace App\Actions\Messaging;

use App\Events\MessagesRead;
use App\Models\Conversation;
use App\Models\User;

class MarkConversationRead
{
    public function handle(Conversation $conversation, User $reader): int
    {
        $now = now();

        $updated = $conversation->messages()
            ->where('sender_id', '!=', $reader->id)
            ->whereNull('read_at')
            ->update(['read_at' => $now]);

        if ($updated > 0) {
            broadcast(new MessagesRead($conversation->id, $reader->id, $now->toIso8601String()))->toOthers();
        }

        return $updated;
    }
}
