<?php

namespace Tests\Feature\Post;

use App\Models\Comment;
use App\Models\CommentReply;
use App\Models\Post;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentReplyTest extends TestCase
{
    use RefreshDatabase;

    public function test_replying_on_an_unpublished_property_returns_404(): void
    {
        $user = User::factory()->create();
        $property = Property::factory()->draft()->create();
        $post = Post::factory()->create(['property_id' => $property->id]);
        $comment = Comment::factory()->create(['post_id' => $post->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/comments/{$comment->id}/replies", ['content' => 'x'])
            ->assertStatus(404);
    }

    public function test_an_authenticated_user_can_reply_to_a_comment(): void
    {
        $user = User::factory()->create();
        $comment = Comment::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/comments/{$comment->id}/replies", ['content' => 'Merci !'])
            ->assertCreated()
            ->assertJsonPath('data.content', 'Merci !');

        $this->assertDatabaseHas('comment_replies', ['comment_id' => $comment->id, 'user_id' => $user->id]);
    }

    public function test_reply_creation_validates_the_payload(): void
    {
        $user = User::factory()->create();
        $comment = Comment::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/comments/{$comment->id}/replies", ['content' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_a_guest_cannot_reply(): void
    {
        $comment = Comment::factory()->create();

        $this->postJson("/api/v1/comments/{$comment->id}/replies", ['content' => 'x'])->assertStatus(401);
    }

    public function test_replying_to_a_missing_comment_returns_404(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/comments/999999/replies', ['content' => 'x'])
            ->assertStatus(404);
    }

    public function test_the_author_can_delete_their_reply(): void
    {
        $user = User::factory()->create();
        $reply = CommentReply::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/comment-replies/{$reply->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('comment_replies', ['id' => $reply->id]);
    }

    public function test_an_admin_can_delete_any_reply(): void
    {
        $admin = User::factory()->admin()->create();
        $reply = CommentReply::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/comment-replies/{$reply->id}")
            ->assertNoContent();
    }

    public function test_another_user_cannot_delete_the_reply(): void
    {
        $reply = CommentReply::factory()->create();
        $intruder = User::factory()->create();

        $this->actingAs($intruder, 'sanctum')
            ->deleteJson("/api/v1/comment-replies/{$reply->id}")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_delete_a_reply(): void
    {
        $reply = CommentReply::factory()->create();

        $this->deleteJson("/api/v1/comment-replies/{$reply->id}")->assertStatus(401);
    }
}
