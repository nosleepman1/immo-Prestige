<?php

namespace App\Actions\Post;

use App\Models\Comment;

class DeleteComment
{
    public function handle(Comment $comment): void
    {
        $comment->delete();
    }
}
