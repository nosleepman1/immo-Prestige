<?php

namespace App\Policies;

use App\Models\CommentReply;
use App\Models\User;

class CommentReplyPolicy
{
    public function create(User $user): bool
    {
        return true; // any authenticated role; auth:sanctum gates guests
    }

    public function update(User $user, CommentReply $commentReply): bool
    {
        return $commentReply->user_id === $user->id;
    }

    public function delete(User $user, CommentReply $commentReply): bool
    {
        return $user->isAdmin() || $commentReply->user_id === $user->id;
    }
}
