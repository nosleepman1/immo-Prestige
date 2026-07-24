<?php

namespace Tests\Feature\Post;

use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicFeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_can_browse_the_feed(): void
    {
        $post = Post::factory()->create();
        Like::factory()->count(2)->create(['post_id' => $post->id]);
        Comment::factory()->create(['post_id' => $post->id]);

        $this->getJson('/api/v1/posts')
            ->assertOk()
            ->assertJsonPath('data.0.likes_count', 2)
            ->assertJsonPath('data.0.comments_count', 1)
            ->assertJsonPath('data.0.is_liked_by_user', false);
    }

    public function test_the_feed_hides_posts_of_unpublished_properties(): void
    {
        $draftProperty = Property::factory()->draft()->create();
        Post::factory()->create(['property_id' => $draftProperty->id]);
        Post::factory()->create(); // published, default factory state

        $this->getJson('/api/v1/posts')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_a_authenticated_user_sees_whether_they_liked_a_post(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();
        Like::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/posts')
            ->assertJsonPath('data.0.is_liked_by_user', true);
    }

    public function test_a_guest_can_view_a_single_published_post(): void
    {
        $post = Post::factory()->create();

        $this->getJson("/api/v1/posts/{$post->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $post->id);
    }

    public function test_viewing_a_post_of_an_unpublished_property_returns_404(): void
    {
        $property = Property::factory()->draft()->create();
        $post = Post::factory()->create(['property_id' => $property->id]);

        $this->getJson("/api/v1/posts/{$post->id}")->assertStatus(404);
    }
}
