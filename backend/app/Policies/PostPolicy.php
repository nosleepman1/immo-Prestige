<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    public function create(User $user): bool
    {
        return $user->isAgency();
    }

    public function delete(User $user, Post $post): bool
    {
        return $user->isAdmin() || $post->user_id === $user->id;
    }
}
