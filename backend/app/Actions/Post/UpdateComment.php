<?php

namespace App\Actions\Post;

use App\Models\Comment;

class UpdateComment
{
    public function handle(Comment $comment, string $content): Comment
    {
        $comment->update(['content' => $content]);

        return $comment;
    }
}
