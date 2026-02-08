<?php

namespace Tests\Feature\RateLimiting;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class ThrottleTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        RateLimiter::clear('login:nobody@example.com|127.0.0.1');
        parent::tearDown();
    }

    public function test_login_is_throttled_after_repeated_attempts(): void
    {
        $payload = ['email' => 'nobody@example.com', 'password' => 'wrong-password'];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', $payload)->assertStatus(401);
        }

        $this->postJson('/api/v1/auth/login', $payload)->assertStatus(429);
    }

    public function test_reporting_is_throttled_after_repeated_attempts(): void
    {
        $user = User::factory()->create();
        $comment = Comment::factory()->create();
        $payload = ['reportable_type' => 'comment', 'reportable_id' => $comment->id, 'reason' => 'spam'];

        for ($i = 0; $i < 10; $i++) {
            $this->actingAs($user, 'sanctum')->postJson('/api/v1/reports', $payload)->assertCreated();
        }

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/reports', $payload)->assertStatus(429);
    }
}
