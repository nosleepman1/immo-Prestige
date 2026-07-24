<?php

namespace App\Http\Controllers;

use App\Actions\Post\ToggleLike;
use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    /**
     * Toggles the authenticated user's like on a post. Idempotent under
     * concurrency via the (post_id, user_id) unique constraint.
     */
    public function toggle(Request $request, Post $post, ToggleLike $toggleLike): JsonResponse
    {
        $this->authorize('create', Like::class);

        abort_unless($post->property()->published()->exists(), 404);

        return response()->json(['data' => $toggleLike->handle($post, $request->user())]);
    }
}
