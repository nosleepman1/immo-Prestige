<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_verified_user_can_login_and_receive_a_token(): void
    {
        $user = User::factory()->create([
            'email' => 'awa@example.com',
            'password' => Hash::make('passer123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'awa@example.com',
            'password' => 'passer123',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.user.email', 'awa@example.com')
            ->assertJsonStructure(['data' => ['user', 'token']]);

        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'awa@example.com',
            'password' => Hash::make('passer123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'awa@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_login_is_blocked_for_unverified_email(): void
    {
        User::factory()->unverified()->create([
            'email' => 'notverified@example.com',
            'password' => Hash::make('passer123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'notverified@example.com',
            'password' => 'passer123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('code', 'EMAIL_NOT_VERIFIED');
    }

    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }
}
