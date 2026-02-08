<?php

namespace Tests\Feature\Post;

use App\Models\Comment;
use App\Models\Post;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_can_read_comments_on_a_published_post(): void
    {
        $post = Post::factory()->create();
        Comment::factory()->create(['post_id' => $post->id]);

        $this->getJson("/api/v1/posts/{$post->id}/comments")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_reading_comments_of_an_unpublished_property_returns_404(): void
    {
        $property = Property::factory()->draft()->create();
        $post = Post::factory()->create(['property_id' => $property->id]);

        $this->getJson("/api/v1/posts/{$post->id}/comments")->assertStatus(404);
    }

    public function test_commenting_on_an_unpublished_property_returns_404(): void
    {
        $user = User::factory()->create();
        $property = Property::factory()->draft()->create();
        $post = Post::factory()->create(['property_id' => $property->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/posts/{$post->id}/comments", ['content' => 'x'])
            ->assertStatus(404);
    }

    public function test_commenting_on_a_missing_post_returns_404(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/posts/999999/comments', ['content' => 'x'])
            ->assertStatus(404);
    }

    public function test_an_authenticated_user_can_comment(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/posts/{$post->id}/comments", ['content' => 'Superbe bien !'])
            ->assertCreated()
            ->assertJsonPath('data.content', 'Superbe bien !');

        $this->assertDatabaseHas('comments', ['post_id' => $post->id, 'user_id' => $user->id]);
    }

    public function test_comment_creation_validates_the_payload(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/posts/{$post->id}/comments", ['content' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_a_guest_cannot_comment(): void
    {
        $post = Post::factory()->create();

        $this->postJson("/api/v1/posts/{$post->id}/comments", ['content' => 'x'])->assertStatus(401);
    }

    public function test_the_author_can_update_their_comment(): void
    {
        $user = User::factory()->create();
        $comment = Comment::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/comments/{$comment->id}", ['content' => 'Modifié'])
            ->assertOk()
            ->assertJsonPath('data.content', 'Modifié');
    }

    public function test_another_user_cannot_update_the_comment(): void
    {
        $comment = Comment::factory()->create();
        $intruder = User::factory()->create();

        $this->actingAs($intruder, 'sanctum')
            ->putJson("/api/v1/comments/{$comment->id}", ['content' => 'Hacked'])
            ->assertStatus(403);
    }

    public function test_the_author_can_delete_their_comment(): void
    {
        $user = User::factory()->create();
        $comment = Comment::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/comments/{$comment->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('comments', ['id' => $comment->id]);
    }

    public function test_an_admin_can_delete_any_comment(): void
    {
        $admin = User::factory()->admin()->create();
        $comment = Comment::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/comments/{$comment->id}")
            ->assertNoContent();
    }

    public function test_another_user_cannot_delete_the_comment(): void
    {
        $comment = Comment::factory()->create();
        $intruder = User::factory()->create();

        $this->actingAs($intruder, 'sanctum')
            ->deleteJson("/api/v1/comments/{$comment->id}")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_delete_a_comment(): void
    {
        $comment = Comment::factory()->create();

        $this->deleteJson("/api/v1/comments/{$comment->id}")->assertStatus(401);
    }

    public function test_deleting_a_missing_comment_returns_404(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/comments/999999')
            ->assertStatus(404);
    }
}
