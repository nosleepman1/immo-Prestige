<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_visitor_can_register_as_a_user(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Awa Ndiaye',
            'email' => 'awa@example.com',
            'password' => 'passer123',
            'password_confirmation' => 'passer123',
            'role' => 'user',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.email', 'awa@example.com')
            ->assertJsonPath('data.role', 'user');

        $this->assertDatabaseHas('users', ['email' => 'awa@example.com']);

        $user = User::whereEmail('awa@example.com')->first();
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_registration_cannot_grant_a_privileged_role(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Sneaky',
            'email' => 'sneaky@example.com',
            'password' => 'passer123',
            'password_confirmation' => 'passer123',
            'role' => 'admin',
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'sneaky@example.com', 'role' => 'user']);
    }

    public function test_registration_requires_a_valid_payload(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_email_must_be_unique(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Awa',
            'email' => 'taken@example.com',
            'password' => 'passer123',
            'password_confirmation' => 'passer123',
            'role' => 'user',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }
}
