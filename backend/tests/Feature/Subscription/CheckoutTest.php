<?php

namespace Tests\Feature\Subscription;

use App\Models\Agency;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_agency_can_checkout_a_plan(): void
    {
        $user = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $user->id]);
        $plan = Plan::factory()->create(['price' => 15000]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/subscriptions/checkout', ['plan_id' => $plan->id])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['payment_id', 'redirect_url']]);

        $this->assertDatabaseHas('payments', [
            'agency_id' => $user->agencies->id,
            'plan_id' => $plan->id,
            'amount' => 15000,
            'status' => 'pending',
        ]);
    }

    public function test_checkout_requires_a_valid_active_plan(): void
    {
        $user = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $user->id]);
        $inactive = Plan::factory()->create(['is_active' => false]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/subscriptions/checkout', ['plan_id' => $inactive->id])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['plan_id']);
    }

    public function test_a_non_agency_cannot_checkout(): void
    {
        $user = User::factory()->create(); // role user
        $plan = Plan::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/subscriptions/checkout', ['plan_id' => $plan->id])
            ->assertStatus(403);
    }

    public function test_a_password_less_agency_cannot_checkout(): void
    {
        $user = User::factory()->agency()->create(['password' => null]);
        Agency::factory()->create(['user_id' => $user->id]);
        $plan = Plan::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/subscriptions/checkout', ['plan_id' => $plan->id])
            ->assertStatus(403)
            ->assertJsonPath('code', 'PASSWORD_NOT_SET');
    }

    public function test_a_guest_cannot_checkout(): void
    {
        $plan = Plan::factory()->create();

        $this->postJson('/api/v1/subscriptions/checkout', ['plan_id' => $plan->id])
            ->assertStatus(401);
    }

    public function test_plans_are_publicly_listed(): void
    {
        Plan::factory()->count(3)->create();
        Plan::factory()->create(['is_active' => false]);

        $this->getJson('/api/v1/subscriptions/plans')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }
}
