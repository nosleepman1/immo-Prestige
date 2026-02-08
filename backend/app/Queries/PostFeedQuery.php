<?php

namespace App\Queries;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Public, paginated feed of posts whose property is currently published.
 * likes_count/comments_count are SQL aggregates (one query for the whole page,
 * not one per item) rather than a denormalized column or a cache — this
 * app's scale doesn't yet justify the staleness/invalidation cost of either.
 */
class PostFeedQuery
{
    public function handle(?int $authUserId, int $perPage = 15): LengthAwarePaginator
    {
        return Post::query()
            ->whereHas('property', fn ($q) => $q->published())
            ->with(['user', 'property.images', 'property.propertyType', 'property.agency', 'property.devise'])
            ->withCount(['likes', 'comments'])
            ->when($authUserId, fn ($q) => $q->withExists([
                'likes as is_liked_by_user' => fn ($q2) => $q2->where('user_id', $authUserId),
            ]))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }
}
