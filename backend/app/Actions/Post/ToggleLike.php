<?php

namespace App\Actions\Post;

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

            return ['liked' => false];
        }

        try {
            Like::create(['post_id' => $post->id, 'user_id' => $user->id]);
        } catch (QueryException) {
            // Unique constraint backstop: a concurrent request already liked it.
        }

        return ['liked' => true];
    }
}
