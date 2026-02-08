<?php

namespace Tests\Feature\Rental;

use App\Models\Agency;
use App\Models\ContractClause;
use App\Models\ContractTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContractTemplateTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: User, 1: Agency} */
    private function agency(): array
    {
        $user = User::factory()->agency()->create();

        return [$user, Agency::factory()->create(['user_id' => $user->id])];
    }

    public function test_an_agency_creates_a_template(): void
    {
        [$user, $agency] = $this->agency();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/agency/contract-templates', ['name' => 'Bail habitation 2026'])
            ->assertCreated()
            // The first template is the default whatever was asked: an agency
            // with templates but no default would generate bare leases.
            ->assertJsonPath('data.is_default', true);

        $this->assertDatabaseHas('contract_templates', [
            'agency_id' => $agency->id,
            'name' => 'Bail habitation 2026',
            'is_default' => true,
        ]);
    }

    public function test_marking_a_template_as_default_demotes_the_previous_one(): void
    {
        [$user, $agency] = $this->agency();
        $first = ContractTemplate::factory()->isDefault()->create(['agency_id' => $agency->id]);
        $second = ContractTemplate::factory()->create(['agency_id' => $agency->id]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/agency/contract-templates/{$second->id}", ['is_default' => true])
            ->assertOk()
            ->assertJsonPath('data.is_default', true);

        // "Which contract did we send?" must always have one answer.
        $this->assertFalse($first->fresh()->is_default);
    }

    public function test_the_listing_shows_only_the_agencys_own_templates(): void
    {
        [$user, $agency] = $this->agency();
        ContractTemplate::factory()->count(2)->create(['agency_id' => $agency->id]);
        ContractTemplate::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/contract-templates')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_an_agency_cannot_read_another_agencys_template(): void
    {
        [$user] = $this->agency();
        $stranger = ContractTemplate::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/agency/contract-templates/{$stranger->id}")
            ->assertStatus(403);
    }

    public function test_an_agency_adds_a_clause(): void
    {
        [$user, $agency] = $this->agency();
        $template = ContractTemplate::factory()->create(['agency_id' => $agency->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/agency/contract-templates/{$template->id}/clauses", [
                'title' => 'Obligations du preneur',
                'body' => 'Le preneur règle {{bail.loyer}} le {{bail.jour_echeance}} de chaque mois.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Obligations du preneur');
    }

    public function test_a_typo_in_a_variable_is_caught_while_editing(): void
    {
        [$user, $agency] = $this->agency();
        $template = ContractTemplate::factory()->create(['agency_id' => $agency->id]);

        // Surfaced now, rather than months later when a real contract fails.
        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/agency/contract-templates/{$template->id}/clauses", [
                'title' => 'Loyer',
                'body' => 'Le preneur règle {{bail.loyers}} chaque mois.',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['body']);
    }

    public function test_the_available_variables_are_published_for_the_editor(): void
    {
        [$user] = $this->agency();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/contract-variables')
            ->assertOk()
            ->assertJsonFragment(['bail.loyer'])
            ->assertJsonFragment(['locataire.nom']);
    }

    public function test_clauses_can_be_reordered(): void
    {
        [$user, $agency] = $this->agency();
        $template = ContractTemplate::factory()->create(['agency_id' => $agency->id]);
        $a = ContractClause::factory()->create(['contract_template_id' => $template->id, 'position' => 0]);
        $b = ContractClause::factory()->create(['contract_template_id' => $template->id, 'position' => 1]);

        // Articles are numbered in the printed contract: order is meaning, not
        // a display preference.
        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/agency/contract-templates/{$template->id}/clauses/order", [
                'ids' => [$b->id, $a->id],
            ])
            ->assertOk();

        $this->assertSame(0, $b->fresh()->position);
        $this->assertSame(1, $a->fresh()->position);
    }

    public function test_an_agency_cannot_edit_a_clause_of_another_agency(): void
    {
        [$user] = $this->agency();
        $clause = ContractClause::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/agency/clauses/{$clause->id}", ['title' => 'Détourné'])
            ->assertStatus(403);
    }

    public function test_a_normal_user_has_no_access_to_templates(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->getJson('/api/v1/agency/contract-templates')
            ->assertStatus(403);
    }

    public function test_a_guest_has_no_access_to_templates(): void
    {
        $this->getJson('/api/v1/agency/contract-templates')->assertStatus(401);
    }

    public function test_creation_validates_the_payload(): void
    {
        [$user] = $this->agency();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/agency/contract-templates', ['name' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_an_unknown_template_is_a_404(): void
    {
        [$user] = $this->agency();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/contract-templates/999999')
            ->assertStatus(404);
    }
}
