<?php

namespace Tests\Feature\Agency;

use App\Models\Agency;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CascadeSoftDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_soft_deleting_a_user_cascades_to_agency_and_properties(): void
    {
        $user = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $user->id]);
        $property = Property::factory()->create(['agency_id' => $agency->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/auth/{$user->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('users', ['id' => $user->id]);
        $this->assertSoftDeleted('agencies', ['id' => $agency->id]);
        $this->assertSoftDeleted('properties', ['id' => $property->id]);
    }
}
