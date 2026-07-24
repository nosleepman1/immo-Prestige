<?php

namespace App\Actions\Post;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;

class CreateComment
{
    public function handle(Post $post, User $user, string $content): Comment
    {
        return Comment::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'content' => $content,
        ]);
    }
}
