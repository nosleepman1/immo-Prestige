<?php

namespace Tests\Feature\User;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeleteUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_soft_delete_their_own_account(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/auth/{$user->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_a_user_cannot_delete_another_account(): void
    {
        $user = User::factory()->create();
        $victim = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/auth/{$victim->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('users', ['id' => $victim->id, 'deleted_at' => null]);
    }

    public function test_a_guest_cannot_delete_a_user(): void
    {
        $user = User::factory()->create();

        $this->deleteJson("/api/v1/auth/{$user->id}")->assertStatus(401);
    }

    public function test_deleting_a_missing_user_returns_404(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/auth/999999')
            ->assertStatus(404);
    }
}
