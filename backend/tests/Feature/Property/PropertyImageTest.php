<?php

namespace Tests\Feature\Property;

use App\Actions\Property\UploadPropertyImage;
use App\Jobs\ResizePropertyImage;
use App\Models\Agency;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PropertyImageTest extends TestCase
{
    use RefreshDatabase;

    private function ownedProperty(): array
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        $property = Property::factory()->draft()->create(['agency_id' => $agency->id]);

        return [$owner, $property];
    }

    public function test_the_owning_agency_can_upload_an_image_which_becomes_the_cover(): void
    {
        Storage::fake('public');
        Queue::fake();
        [$owner, $property] = $this->ownedProperty();

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/images", [
                'image' => UploadedFile::fake()->image('villa.jpg', 2000, 1200),
            ])
            ->assertCreated()
            ->assertJsonPath('data.is_cover', true)
            ->assertJsonPath('data.position', 0);

        $this->assertDatabaseCount('property_images', 1);
        Queue::assertPushedOn('media', ResizePropertyImage::class);
    }

    public function test_a_second_upload_is_not_a_cover_and_gets_the_next_position(): void
    {
        Storage::fake('public');
        Queue::fake();
        [$owner, $property] = $this->ownedProperty();
        PropertyImage::factory()->create(['property_id' => $property->id, 'is_cover' => true, 'position' => 0]);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/images", [
                'image' => UploadedFile::fake()->image('salon.jpg'),
            ])
            ->assertCreated()
            ->assertJsonPath('data.is_cover', false)
            ->assertJsonPath('data.position', 1);
    }

    public function test_upload_rejects_a_non_image_file(): void
    {
        Storage::fake('public');
        [$owner, $property] = $this->ownedProperty();

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/images", [
                'image' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_upload_enforces_the_maximum_image_count(): void
    {
        Storage::fake('public');
        Queue::fake();
        [$owner, $property] = $this->ownedProperty();
        PropertyImage::factory()->count(UploadPropertyImage::MAX_IMAGES)->create(['property_id' => $property->id]);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/images", [
                'image' => UploadedFile::fake()->image('extra.jpg'),
            ])
            ->assertStatus(409)
            ->assertJsonPath('code', 'TOO_MANY_IMAGES');
    }

    public function test_another_agency_cannot_upload_to_someone_elses_property(): void
    {
        Storage::fake('public');
        [, $property] = $this->ownedProperty();
        $intruder = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $intruder->id]);

        $this->actingAs($intruder, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/images", [
                'image' => UploadedFile::fake()->image('x.jpg'),
            ])
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_upload(): void
    {
        Storage::fake('public');
        [, $property] = $this->ownedProperty();

        $this->postJson("/api/v1/properties/{$property->id}/images", [
            'image' => UploadedFile::fake()->image('x.jpg'),
        ])->assertStatus(401);
    }

    public function test_the_owner_can_reorder_images(): void
    {
        [$owner, $property] = $this->ownedProperty();
        $first = PropertyImage::factory()->create(['property_id' => $property->id, 'position' => 0]);
        $second = PropertyImage::factory()->create(['property_id' => $property->id, 'position' => 1]);

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}/images/order", [
                'image_ids' => [$second->id, $first->id],
            ])
            ->assertOk();

        $this->assertDatabaseHas('property_images', ['id' => $second->id, 'position' => 0]);
        $this->assertDatabaseHas('property_images', ['id' => $first->id, 'position' => 1]);
    }

    public function test_reorder_validates_that_ids_exist(): void
    {
        [$owner, $property] = $this->ownedProperty();

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}/images/order", ['image_ids' => [999999]])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image_ids.0']);
    }

    public function test_another_agency_cannot_reorder_someone_elses_images(): void
    {
        [, $property] = $this->ownedProperty();
        $image = PropertyImage::factory()->create(['property_id' => $property->id]);
        $intruder = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $intruder->id]);

        $this->actingAs($intruder, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}/images/order", ['image_ids' => [$image->id]])
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_reorder(): void
    {
        [, $property] = $this->ownedProperty();
        $image = PropertyImage::factory()->create(['property_id' => $property->id]);

        $this->putJson("/api/v1/properties/{$property->id}/images/order", ['image_ids' => [$image->id]])
            ->assertStatus(401);
    }

    public function test_the_owner_can_change_the_cover_image(): void
    {
        [$owner, $property] = $this->ownedProperty();
        $cover = PropertyImage::factory()->create(['property_id' => $property->id, 'is_cover' => true]);
        $other = PropertyImage::factory()->create(['property_id' => $property->id, 'is_cover' => false]);

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/v1/property-images/{$other->id}/cover")
            ->assertOk()
            ->assertJsonPath('data.is_cover', true);

        $this->assertDatabaseHas('property_images', ['id' => $cover->id, 'is_cover' => false]);
        $this->assertDatabaseHas('property_images', ['id' => $other->id, 'is_cover' => true]);
    }

    public function test_another_agency_cannot_change_the_cover(): void
    {
        [, $property] = $this->ownedProperty();
        $image = PropertyImage::factory()->create(['property_id' => $property->id]);
        $intruder = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $intruder->id]);

        $this->actingAs($intruder, 'sanctum')
            ->putJson("/api/v1/property-images/{$image->id}/cover")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_change_the_cover(): void
    {
        [, $property] = $this->ownedProperty();
        $image = PropertyImage::factory()->create(['property_id' => $property->id]);

        $this->putJson("/api/v1/property-images/{$image->id}/cover")->assertStatus(401);
    }

    public function test_the_owner_can_delete_an_image(): void
    {
        [$owner, $property] = $this->ownedProperty();
        $image = PropertyImage::factory()->create(['property_id' => $property->id]);

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/v1/property-images/{$image->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('property_images', ['id' => $image->id]);
    }

    public function test_another_agency_cannot_delete_the_image(): void
    {
        [, $property] = $this->ownedProperty();
        $image = PropertyImage::factory()->create(['property_id' => $property->id]);
        $intruder = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $intruder->id]);

        $this->actingAs($intruder, 'sanctum')
            ->deleteJson("/api/v1/property-images/{$image->id}")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_delete_an_image(): void
    {
        [, $property] = $this->ownedProperty();
        $image = PropertyImage::factory()->create(['property_id' => $property->id]);

        $this->deleteJson("/api/v1/property-images/{$image->id}")->assertStatus(401);
    }
}
