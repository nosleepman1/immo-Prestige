<?php

namespace App\Http\Controllers;

use App\Actions\Post\CreatePost;
use App\Http\Requests\StorePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\Property;
use App\Queries\PostFeedQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    /**
     * Public feed of published properties, newest first.
     */
    public function index(Request $request, PostFeedQuery $query): AnonymousResourceCollection
    {
        return PostResource::collection($query->handle($request->user('sanctum')?->id));
    }

    public function show(Request $request, Post $post): PostResource
    {
        abort_unless($post->property()->published()->exists(), 404);

        $post->loadCount(['likes', 'comments']);
        $post->load(['user', 'property.images', 'property.propertyType', 'property.agency', 'property.devise']);

        if ($user = $request->user('sanctum')) {
            $post->is_liked_by_user = $post->likes()->where('user_id', $user->id)->exists();
        }

        return new PostResource($post);
    }

    public function store(StorePostRequest $request, CreatePost $createPost): JsonResponse
    {
        $this->authorize('create', Post::class);

        $property = Property::findOrFail($request->validated()['property_id']);
        $this->authorize('update', $property); // must own the property being posted

        $post = $createPost->handle($request->user(), $property);

        return PostResource::make($post->load('user'))->response()->setStatusCode(201);
    }

    public function destroy(Post $post): JsonResponse
    {
        $this->authorize('delete', $post);

        $post->delete();

        return response()->json(null, 204);
    }
}
