<?php

namespace Tests\Feature\Agency;

use App\Models\Agency;
use App\Models\PasswordSetupToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SetAgencyPasswordTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: string} the agency user and the plaintext token
     */
    private function acceptedAgencyWithToken(array $tokenOverrides = []): array
    {
        $user = User::factory()->agency()->create(['email' => 'agence@example.com', 'password' => null]);
        Agency::factory()->create(['user_id' => $user->id, 'activated_at' => null]);

        $plaintext = 'plain-setup-token';
        PasswordSetupToken::create(array_merge([
            'user_id' => $user->id,
            'token' => hash('sha256', $plaintext),
            'expires_at' => now()->addDay(),
        ], $tokenOverrides));

        return [$user, $plaintext];
    }

    public function test_an_accepted_agency_can_set_its_password_and_is_logged_in(): void
    {
        [$user, $token] = $this->acceptedAgencyWithToken();

        $response = $this->postJson('/api/v1/agency/password', [
            'email' => 'agence@example.com',
            'token' => $token,
            'password' => 'passer123',
            'password_confirmation' => 'passer123',
        ]);

        $response->assertOk()->assertJsonStructure(['data' => ['user', 'agency', 'access_token']]);

        $user->refresh();
        $this->assertNotNull($user->password);
        $this->assertNotNull($user->agencies->activated_at);
        $this->assertDatabaseCount('password_setup_tokens', 1);
        $this->assertNotNull(PasswordSetupToken::first()->used_at);
    }

    public function test_an_expired_token_is_rejected(): void
    {
        [$user, $token] = $this->acceptedAgencyWithToken(['expires_at' => now()->subHour()]);

        $this->postJson('/api/v1/agency/password', [
            'email' => 'agence@example.com',
            'token' => $token,
            'password' => 'passer123',
            'password_confirmation' => 'passer123',
        ])->assertStatus(410)->assertJsonPath('code', 'TOKEN_EXPIRED');
    }

    public function test_a_used_token_cannot_be_reused(): void
    {
        [$user, $token] = $this->acceptedAgencyWithToken(['used_at' => now()]);

        $this->postJson('/api/v1/agency/password', [
            'email' => 'agence@example.com',
            'token' => $token,
            'password' => 'passer123',
            'password_confirmation' => 'passer123',
        ])->assertStatus(410)->assertJsonPath('code', 'TOKEN_ALREADY_USED');
    }

    public function test_it_validates_the_password(): void
    {
        [$user, $token] = $this->acceptedAgencyWithToken();

        $this->postJson('/api/v1/agency/password', [
            'email' => 'agence@example.com',
            'token' => $token,
            'password' => 'short',
        ])->assertStatus(422)->assertJsonValidationErrors(['password']);
    }

    public function test_a_wrong_token_is_rejected(): void
    {
        $this->acceptedAgencyWithToken();

        $this->postJson('/api/v1/agency/password', [
            'email' => 'agence@example.com',
            'token' => 'wrong-token',
            'password' => 'passer123',
            'password_confirmation' => 'passer123',
        ])->assertStatus(422);
    }
}
