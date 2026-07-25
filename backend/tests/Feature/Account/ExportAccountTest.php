<?php

namespace Tests\Feature\Account;

use App\Models\Comment;
use App\Models\Like;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_export_their_own_data(): void
    {
        $user = User::factory()->create();
        Comment::factory()->create(['user_id' => $user->id, 'content' => 'Mon avis']);
        Like::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/account/export')
            ->assertOk()
            ->assertJsonPath('data.profile.email', $user->email)
            ->assertJsonPath('data.agency', null)
            ->assertJsonCount(1, 'data.comments')
            ->assertJsonCount(1, 'data.likes');
    }

    public function test_a_guest_cannot_export(): void
    {
        $this->getJson('/api/v1/account/export')->assertStatus(401);
    }
}
