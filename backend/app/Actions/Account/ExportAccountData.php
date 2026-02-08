<?php

namespace App\Actions\Account;

use App\Models\Agency;
use App\Models\User;

/**
 * GDPR data export: everything personally identifiable this user's account
 * is tied to, in one flat structure. Deliberately excludes other people's
 * data (e.g. other participants' message content beyond what this user sent).
 */
class ExportAccountData
{
    /**
     * @return array<string, mixed>
     */
    public function handle(User $user): array
    {
        $agency = Agency::whereBelongsTo($user)->first();

        return [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
            'agency' => $agency ? [
                'company_name' => $agency->company_name,
                'manager_name' => $agency->manager_name,
                'address' => $agency->address,
                'city' => $agency->city,
                'phone' => $agency->phone,
                'status' => $agency->status,
                'properties_count' => $agency->properties()->count(),
            ] : null,
            'messages_sent' => $user->messages()->select('conversation_id', 'content', 'created_at')->get(),
            'comments' => $user->comments()->select('post_id', 'content', 'created_at')->get(),
            'likes' => $user->likes()->pluck('post_id'),
        ];
    }
}
