<?php

namespace App\Queries;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * The authenticated user's conversations, whichever side they're on (client
 * or the agency they own), with a per-conversation unread count computed as
 * a SQL aggregate (one query for the whole page).
 */
class ConversationListQuery
{
    public function handle(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return Conversation::query()
            ->with(['property', 'client', 'agency'])
            ->where(function ($q) use ($user) {
                $q->where('client_id', $user->id)
                    ->orWhereHas('agency', fn ($q2) => $q2->where('user_id', $user->id));
            })
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('sender_id', '!=', $user->id)->whereNull('read_at');
            }])
            ->orderByDesc('last_message_at')
            ->paginate($perPage);
    }
}
