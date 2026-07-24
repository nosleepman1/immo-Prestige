<?php

namespace Tests\Feature\Post;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LikeTest extends TestCase
{
    use RefreshDatabase;

    public function test_liking_then_liking_again_toggles_off(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/posts/{$post->id}/like")
            ->assertOk()
            ->assertJsonPath('data.liked', true);

        $this->assertDatabaseHas('likes', ['post_id' => $post->id, 'user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/posts/{$post->id}/like")
            ->assertOk()
            ->assertJsonPath('data.liked', false);

        $this->assertDatabaseMissing('likes', ['post_id' => $post->id, 'user_id' => $user->id]);
    }

    public function test_a_guest_cannot_like(): void
    {
        $post = Post::factory()->create();

        $this->postJson("/api/v1/posts/{$post->id}/like")->assertStatus(401);
    }

    public function test_liking_a_missing_post_returns_404(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/posts/999999/like')
            ->assertStatus(404);
    }
}
