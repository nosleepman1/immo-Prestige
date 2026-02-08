<?php

namespace Tests\Feature\Verification;

use App\Models\Agency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BadgeCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_agency_can_checkout_the_verification_badge(): void
    {
        $user = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/verification/checkout')
            ->assertCreated()
            ->assertJsonStructure(['data' => ['payment_id', 'redirect_url']]);

        $this->assertDatabaseHas('payments', [
            'agency_id' => $user->agencies->id,
            'purpose' => 'verification_badge',
            'amount' => 10000,
            'status' => 'pending',
        ]);
    }

    public function test_a_non_agency_cannot_checkout_the_badge(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/verification/checkout')
            ->assertStatus(403);
    }

    public function test_a_password_less_agency_cannot_checkout_the_badge(): void
    {
        $user = User::factory()->agency()->create(['password' => null]);
        Agency::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/verification/checkout')
            ->assertStatus(403)
            ->assertJsonPath('code', 'PASSWORD_NOT_SET');
    }

    public function test_a_guest_cannot_checkout_the_badge(): void
    {
        $this->postJson('/api/v1/verification/checkout')->assertStatus(401);
    }
}
