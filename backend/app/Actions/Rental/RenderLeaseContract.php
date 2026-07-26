<?php

namespace App\Actions\Rental;

use App\Models\Lease;
use App\Support\ContractVariables;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

/**
 * Assembles the lease PDF: the platform owns the structure (parties, property,
 * duration, money, payment terms, signature blocks), the agency owns the
 * articles in between.
 *
 * Stored on the private disk. A contract carries both parties' names and the
 * rent they agreed on; it is served through a policy-checked route, never a URL.
 */
class RenderLeaseContract
{
    public function __construct(private readonly ContractVariables $variables) {}

    /**
     * @throws \App\Exceptions\UnknownContractVariableException
     */
    public function handle(Lease $lease): string
    {
        $lease->loadMissing(['agency', 'tenant', 'property', 'owner', 'template.clauses']);

        $variables = $this->variables->for($lease);

        // Substituted before rendering so a typo in a clause fails here, with a
        // message naming the offending variable, rather than producing a
        // contract with a hole in it.
        $clauses = $lease->template?->clauses
            ->map(fn ($clause) => [
                'title' => $this->variables->substitute($clause->title, $variables),
                'body' => $this->variables->substitute($clause->body, $variables),
            ])
            ->values() ?? collect();

        $pdf = Pdf::loadView('pdf.lease-contract', [
            'lease' => $lease,
            'v' => $variables,
            'clauses' => $clauses,
            'monthlyTotal' => number_format($lease->monthlyTotal(), 0, ',', ' ').' FCFA',
            'initialPayment' => number_format($lease->initialPayment(), 0, ',', ' ').' FCFA',
            'periodicity' => strtolower($lease->periodicity->label()),
        ])->setPaper('a4');

        $path = "leases/{$lease->id}/contrat-{$lease->reference}.pdf";
        Storage::disk('local')->put($path, $pdf->output());

        return $path;
    }
}
