<?php

namespace Tests\Feature\Property;

use App\Models\Agency;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublishPropertyTest extends TestCase
{
    use RefreshDatabase;

    private function agencyWithActiveSubscription(?int $propertyQuota = null): array
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        Subscription::factory()->active()->create([
            'agency_id' => $agency->id,
            'quota_snapshot' => ['property_quota' => $propertyQuota, 'featured_quota' => 1],
        ]);

        return [$owner, $agency];
    }

    private function completeDraft(Agency $agency): Property
    {
        $property = Property::factory()->draft()->create([
            'agency_id' => $agency->id,
            'description' => 'Une belle villa avec piscine.',
        ]);
        PropertyImage::factory()->create(['property_id' => $property->id]);

        return $property;
    }

    public function test_an_agency_can_publish_a_complete_property_with_an_active_subscription(): void
    {
        [$owner, $agency] = $this->agencyWithActiveSubscription();
        $property = $this->completeDraft($agency);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/publish")
            ->assertOk()
            ->assertJsonPath('data.status', 'published');

        $this->assertDatabaseHas('properties', ['id' => $property->id, 'status' => 'published']);
    }

    public function test_publish_requires_an_active_subscription(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]); // no subscription
        $property = $this->completeDraft($agency);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/publish")
            ->assertStatus(402)
            ->assertJsonPath('code', 'SUBSCRIPTION_INACTIVE');

        $this->assertDatabaseHas('properties', ['id' => $property->id, 'status' => 'draft']);
    }

    public function test_publish_fails_when_the_plan_quota_is_exceeded(): void
    {
        [$owner, $agency] = $this->agencyWithActiveSubscription(propertyQuota: 1);
        Property::factory()->published()->create(['agency_id' => $agency->id]); // fills the quota
        $property = $this->completeDraft($agency);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/publish")
            ->assertStatus(409)
            ->assertJsonPath('code', 'PROPERTY_QUOTA_EXCEEDED');
    }

    public function test_publish_fails_when_the_listing_is_incomplete(): void
    {
        [$owner, $agency] = $this->agencyWithActiveSubscription();
        $property = Property::factory()->draft()->create([
            'agency_id' => $agency->id,
            'description' => null,
        ]); // no images either

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/publish")
            ->assertStatus(422)
            ->assertJsonPath('code', 'INCOMPLETE_LISTING');
    }

    public function test_another_agency_cannot_publish_someone_elses_property(): void
    {
        [, $agency] = $this->agencyWithActiveSubscription();
        $property = $this->completeDraft($agency);
        [$intruder] = $this->agencyWithActiveSubscription();

        $this->actingAs($intruder, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/publish")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_publish(): void
    {
        [, $agency] = $this->agencyWithActiveSubscription();
        $property = $this->completeDraft($agency);

        $this->postJson("/api/v1/properties/{$property->id}/publish")->assertStatus(401);
    }

    public function test_publishing_a_missing_property_returns_404(): void
    {
        [$owner] = $this->agencyWithActiveSubscription();

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/properties/999999/publish')
            ->assertStatus(404);
    }
}
