<?php

namespace App\Actions\Post;

use App\Events\PostLikesUpdated;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\QueryException;

class ToggleLike
{
    /**
     * @return array{liked: bool}
     */
    public function handle(Post $post, User $user): array
    {
        $existing = Like::where('post_id', $post->id)->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            try {
                Like::create(['post_id' => $post->id, 'user_id' => $user->id]);
            } catch (QueryException $e) {
                if ($e->getCode() !== '23000') {
                    throw $e;
                }
                // Unique constraint backstop: a concurrent request already liked it.
            }
            $liked = true;
        }

        // Public channel, aggregate only — no user identity travels here.
        broadcast(new PostLikesUpdated($post->id, $post->likes()->count()))->toOthers();

        return ['liked' => $liked];
    }
}
