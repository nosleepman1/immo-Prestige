<?php

namespace Tests\Feature\Agency;

use App\Models\Agency;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnsurePasswordIsSetTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_agency_without_a_password_cannot_manage_properties(): void
    {
        $user = User::factory()->agency()->create(['password' => null]);
        $agency = Agency::factory()->create(['user_id' => $user->id]);
        $property = Property::factory()->create(['agency_id' => $agency->id]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", ['name' => 'X'])
            ->assertStatus(403)
            ->assertJsonPath('code', 'PASSWORD_NOT_SET');
    }

    public function test_an_agency_without_a_password_cannot_delete_its_own_agency(): void
    {
        $user = User::factory()->agency()->create(['password' => null]);
        $agency = Agency::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/agency/{$agency->id}")
            ->assertStatus(403)
            ->assertJsonPath('code', 'PASSWORD_NOT_SET');

        $this->assertDatabaseHas('agencies', ['id' => $agency->id, 'deleted_at' => null]);
    }

    public function test_an_agency_with_a_password_can_manage_properties(): void
    {
        $user = User::factory()->agency()->create(); // factory sets a password
        $agency = Agency::factory()->create(['user_id' => $user->id]);
        $property = Property::factory()->create(['agency_id' => $agency->id]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", ['name' => 'Villa'])
            ->assertOk();
    }
}
