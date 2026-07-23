<?php

namespace Tests\Feature\User;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_update_their_own_account(): void
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/auth/{$user->id}", ['name' => 'New Name'])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name']);
    }

    public function test_a_user_cannot_update_another_account(): void
    {
        $user = User::factory()->create();
        $victim = User::factory()->create(['name' => 'Victim']);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/auth/{$victim->id}", ['name' => 'Hacked'])
            ->assertStatus(403);

        $this->assertDatabaseHas('users', ['id' => $victim->id, 'name' => 'Victim']);
    }

    public function test_a_user_cannot_escalate_their_own_role(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/auth/{$user->id}", ['role' => 'admin']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'user']);
    }

    public function test_email_is_normalized_to_lowercase_on_update(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/auth/{$user->id}", ['email' => 'Mixed.Case@Example.COM'])
            ->assertOk();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => 'mixed.case@example.com']);
    }

    public function test_a_guest_cannot_update_a_user(): void
    {
        $user = User::factory()->create();

        $this->putJson("/api/v1/auth/{$user->id}", ['name' => 'X'])
            ->assertStatus(401);
    }

    public function test_update_validates_the_payload(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/auth/{$user->id}", ['email' => 'not-an-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_updating_a_missing_user_returns_404(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/auth/999999', ['name' => 'X'])
            ->assertStatus(404);
    }
}
