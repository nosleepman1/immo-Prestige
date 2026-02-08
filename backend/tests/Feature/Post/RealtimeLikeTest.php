<?php

namespace Tests\Feature\Post;

use App\Events\PostLikesUpdated;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class RealtimeLikeTest extends TestCase
{
    use RefreshDatabase;

    public function test_liking_broadcasts_the_updated_aggregate_count_only(): void
    {
        Event::fake([PostLikesUpdated::class]);
        $user = User::factory()->create();
        $post = Post::factory()->create();

        $this->actingAs($user, 'sanctum')->postJson("/api/v1/posts/{$post->id}/like")->assertOk();

        Event::assertDispatched(PostLikesUpdated::class, function (PostLikesUpdated $event) use ($post) {
            return $event->postId === $post->id && $event->likesCount === 1;
        });
    }
}
