<?php

namespace Tests\Feature\Post;

use App\Models\Agency;
use App\Models\Post;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreatePostTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_agency_can_post_its_own_published_property(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        $property = Property::factory()->published()->create(['agency_id' => $agency->id]);

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/posts', ['property_id' => $property->id])
            ->assertCreated();

        $this->assertDatabaseHas('posts', ['property_id' => $property->id, 'user_id' => $owner->id]);
    }

    public function test_posting_an_unpublished_property_is_rejected(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        $property = Property::factory()->draft()->create(['agency_id' => $agency->id]);

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/posts', ['property_id' => $property->id])
            ->assertStatus(422)
            ->assertJsonPath('code', 'PROPERTY_NOT_PUBLISHED');
    }

    public function test_posting_the_same_property_twice_is_rejected(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        $property = Property::factory()->published()->create(['agency_id' => $agency->id]);
        Post::factory()->create(['property_id' => $property->id]);

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/posts', ['property_id' => $property->id])
            ->assertStatus(409)
            ->assertJsonPath('code', 'PROPERTY_ALREADY_POSTED');
    }

    public function test_an_agency_cannot_post_someone_elses_property(): void
    {
        $owner = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $owner->id]);
        $property = Property::factory()->published()->create(); // another agency

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/posts', ['property_id' => $property->id])
            ->assertStatus(403);
    }

    public function test_a_normal_user_cannot_post(): void
    {
        $user = User::factory()->create();
        $property = Property::factory()->published()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/posts', ['property_id' => $property->id])
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_post(): void
    {
        $property = Property::factory()->published()->create();

        $this->postJson('/api/v1/posts', ['property_id' => $property->id])->assertStatus(401);
    }

    public function test_creation_validates_the_payload(): void
    {
        $owner = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/posts', ['property_id' => 999999])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['property_id']);
    }

    public function test_the_owner_can_delete_its_post(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        $property = Property::factory()->published()->create(['agency_id' => $agency->id]);
        $post = Post::factory()->create(['user_id' => $owner->id, 'property_id' => $property->id]);

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/v1/posts/{$post->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    public function test_another_agency_cannot_delete_the_post(): void
    {
        $post = Post::factory()->create();
        $intruder = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $intruder->id]);

        $this->actingAs($intruder, 'sanctum')
            ->deleteJson("/api/v1/posts/{$post->id}")
            ->assertStatus(403);
    }

    public function test_deleting_a_missing_post_returns_404(): void
    {
        $owner = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner, 'sanctum')
            ->deleteJson('/api/v1/posts/999999')
            ->assertStatus(404);
    }
}
