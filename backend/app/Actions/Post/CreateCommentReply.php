<?php

namespace App\Actions\Post;

use App\Models\Comment;
use App\Models\CommentReply;
use App\Models\User;

/**
 * A reply always targets a top-level Comment — CommentReply has no parent_id,
 * so nesting deeper than one level is structurally impossible.
 */
class CreateCommentReply
{
    public function handle(Comment $comment, User $user, string $content): CommentReply
    {
        return CommentReply::create([
            'comment_id' => $comment->id,
            'user_id' => $user->id,
            'content' => $content,
        ]);
    }
}
