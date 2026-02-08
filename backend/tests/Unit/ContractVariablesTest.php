<?php

namespace Tests\Unit;

use App\Exceptions\UnknownContractVariableException;
use App\Models\Lease;
use App\Support\ContractVariables;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Substitution branches in many directions for a single rule; testing it here
 * rather than through a full HTTP round trip per case keeps it readable.
 */
class ContractVariablesTest extends TestCase
{
    use RefreshDatabase;

    private ContractVariables $variables;

    protected function setUp(): void
    {
        parent::setUp();
        $this->variables = new ContractVariables;
    }

    public function test_the_published_list_matches_what_substitution_actually_provides(): void
    {
        $lease = Lease::factory()->create();

        // The declared vocabulary and the values built for a real lease are two
        // separate lists; letting them drift would publish a variable that
        // then fails at generation, or hide one that works.
        $this->assertSame(
            $this->variables->available(),
            array_keys($this->variables->for($lease)),
        );
    }

    public function test_a_known_variable_is_replaced_by_its_value(): void
    {
        $lease = Lease::factory()->create(['rent_amount' => 150_000, 'payment_day' => 5]);
        $vars = $this->variables->for($lease);

        $this->assertSame(
            'Le loyer de 150 000 FCFA est payable le 5 de chaque mois.',
            $this->variables->substitute(
                'Le loyer de {{bail.loyer}} est payable le {{bail.jour_echeance}} de chaque mois.',
                $vars
            )
        );
    }

    public function test_whitespace_inside_the_braces_is_tolerated(): void
    {
        $lease = Lease::factory()->create(['rent_amount' => 90_000]);

        $this->assertSame(
            '90 000 FCFA',
            $this->variables->substitute('{{ bail.loyer }}', $this->variables->for($lease))
        );
    }

    public function test_an_unknown_variable_raises_rather_than_rendering_empty(): void
    {
        $lease = Lease::factory()->create();

        $this->expectException(UnknownContractVariableException::class);

        $this->variables->substitute('Le loyer de {{bail.loyers}}.', $this->variables->for($lease));
    }

    public function test_the_error_names_every_offending_variable_at_once(): void
    {
        $lease = Lease::factory()->create();

        try {
            $this->variables->substitute(
                '{{bail.loyers}} et {{locataire.prenom}} et {{bail.loyer}}',
                $this->variables->for($lease)
            );
            $this->fail('an unknown variable should have raised');
        } catch (UnknownContractVariableException $e) {
            // Naming them one at a time would mean as many failed generations
            // as there are typos.
            $this->assertEqualsCanonicalizing(['bail.loyers', 'locataire.prenom'], $e->unknown);
        }
    }

    public function test_a_body_without_variables_is_left_untouched(): void
    {
        $lease = Lease::factory()->create();

        $this->assertSame(
            'Le preneur occupe les lieux paisiblement.',
            $this->variables->substitute('Le preneur occupe les lieux paisiblement.', $this->variables->for($lease))
        );
    }

    public function test_unknown_variables_can_be_listed_without_a_lease(): void
    {
        // This is what the clause editor calls: no contract exists yet.
        $this->assertSame(
            ['bail.loyers'],
            $this->variables->unknownVariablesIn('Le loyer de {{bail.loyers}} et {{bail.charges}}.')
        );
    }
}
