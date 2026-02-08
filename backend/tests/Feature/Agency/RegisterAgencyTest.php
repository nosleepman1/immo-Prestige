<?php

namespace Tests\Feature\Agency;

use App\Mail\NewAgencyRequestMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RegisterAgencyTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'company_name' => 'Prestige Immo',
            'manager_name' => 'Awa Ndiaye',
            'description' => 'Agence haut de gamme',
            'address' => '10 rue de Dakar',
            'city' => 'Dakar',
            'activity_zone' => 'Dakar',
            'phone' => '+221770000000',
            'email' => 'agence@example.com',
            'id_card' => 'SN-123456',
            'id_card_document' => UploadedFile::fake()->create('id.pdf', 100, 'application/pdf'),
            'business_registry_document' => UploadedFile::fake()->create('registry.pdf', 100, 'application/pdf'),
        ], $overrides);
    }

    public function test_an_agency_can_register_and_lands_in_pending(): void
    {
        Storage::fake('public');
        Mail::fake();

        $admin = User::factory()->admin()->create();

        $response = $this->postJson('/api/v1/agency/register', $this->payload());

        $response->assertCreated()
            ->assertJsonPath('data.agency.status', 'pending')
            ->assertJsonStructure(['data' => ['agency', 'access_token']]);

        $this->assertDatabaseHas('agencies', ['company_name' => 'Prestige Immo', 'status' => 'pending']);
        $this->assertDatabaseHas('users', ['email' => 'agence@example.com', 'role' => 'agency', 'password' => null]);
        $this->assertDatabaseCount('agency_documents', 2);

        Mail::assertQueued(NewAgencyRequestMail::class);
    }

    public function test_registration_requires_the_mandatory_documents(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/v1/agency/register', $this->payload([
            'business_registry_document' => null,
        ]));

        $response->assertStatus(422)->assertJsonValidationErrors(['business_registry_document']);
    }

    public function test_registration_validates_the_payload(): void
    {
        $response = $this->postJson('/api/v1/agency/register', ['email' => 'not-an-email']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['company_name', 'manager_name', 'email']);
    }
}
