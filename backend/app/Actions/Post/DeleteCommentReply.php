<?php

namespace App\Actions\Post;

use App\Models\CommentReply;

class DeleteCommentReply
{
    public function handle(CommentReply $commentReply): void
    {
        $commentReply->delete();
    }
}
