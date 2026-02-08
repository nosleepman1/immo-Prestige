<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerifyEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_valid_hash_verifies_the_email(): void
    {
        $user = User::factory()->unverified()->create();
        $hash = sha1($user->getEmailForVerification());

        $this->getJson("/api/v1/auth/verify/{$user->id}/{$hash}")
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_an_invalid_hash_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();

        $this->getJson("/api/v1/auth/verify/{$user->id}/wrong-hash")
            ->assertStatus(400)
            ->assertJsonPath('code', 'INVALID_HASH');

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_verifying_a_missing_user_returns_404(): void
    {
        $hash = sha1('nobody@example.com');

        $this->getJson("/api/v1/auth/verify/999999/{$hash}")->assertStatus(404);
    }
}
