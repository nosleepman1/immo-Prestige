<?php

namespace App\Support;

use App\Exceptions\UnknownContractVariableException;
use App\Models\Lease;

/**
 * Substitutes {{variables}} in the clauses an agency wrote.
 *
 * The one rule that matters: an unknown variable raises an error at generation
 * rather than rendering empty. A lease that silently reads "le loyer mensuel est
 * de  FCFA" because someone typed {{bail.loyers}} is worse than no lease at all,
 * and nobody proof-reads a document they believe the machine assembled.
 */
class ContractVariables
{
    /**
     * A tenant's identity-document number is not collected by the platform, so
     * the printed contract leaves a blank to complete by hand. The document is
     * printed and signed on paper anyway.
     */
    private const HANDWRITTEN_BLANK = '............................';

    /**
     * The vocabulary an agency may use in its clauses. Declared rather than
     * derived from a blank lease: the list has to be answerable without one,
     * since the clause editor asks for it before any lease exists.
     */
    private const KEYS = [
        'agence.nom', 'agence.adresse', 'proprietaire.nom',
        'locataire.nom', 'locataire.piece_identite',
        'bien.designation', 'bien.adresse', 'bien.surface',
        'bail.reference', 'bail.date_debut', 'bail.date_fin', 'bail.duree_mois',
        'bail.loyer', 'bail.charges', 'bail.caution', 'bail.mois_avance',
        'bail.preavis_jours', 'bail.jour_echeance',
    ];

    /**
     * @return array<string, string>
     */
    public function for(Lease $lease): array
    {
        $lease->loadMissing(['agency', 'tenant', 'property', 'owner']);
        $property = $lease->property;

        return [
            'agence.nom' => (string) $lease->agency?->company_name,
            'agence.adresse' => trim(($lease->agency?->address ?? '').', '.($lease->agency?->city ?? ''), ', '),
            'proprietaire.nom' => $lease->owner?->fullName() ?: $lease->agency?->company_name ?? '',

            'locataire.nom' => (string) $lease->tenant?->name,
            'locataire.piece_identite' => self::HANDWRITTEN_BLANK,

            'bien.designation' => (string) $property?->name,
            'bien.adresse' => trim(($property?->city ?? '').', '.($property?->region ?? '').', '.($property?->country ?? ''), ', '),
            'bien.surface' => $property ? $this->number((float) $property->surface).' m²' : '',

            'bail.reference' => (string) $lease->reference,
            'bail.date_debut' => $lease->start_date?->format('d/m/Y') ?? '',
            'bail.date_fin' => $lease->end_date?->format('d/m/Y') ?? '',
            'bail.duree_mois' => (string) $lease->duration_months,
            'bail.loyer' => $this->money($lease->rent_amount),
            'bail.charges' => $this->money($lease->charges_amount),
            'bail.caution' => $this->money($lease->deposit_amount),
            'bail.mois_avance' => (string) $lease->advance_months,
            'bail.preavis_jours' => (string) $lease->notice_period_days,
            'bail.jour_echeance' => (string) $lease->payment_day,
        ];
    }

    /**
     * @return array<int, string>
     */
    public function available(): array
    {
        return self::KEYS;
    }

    /**
     * @param  array<string, string>  $variables
     *
     * @throws UnknownContractVariableException
     */
    public function substitute(string $body, array $variables): string
    {
        preg_match_all('/\{\{\s*([a-z_]+\.[a-z_]+)\s*\}\}/i', $body, $matches);

        $used = array_unique($matches[1]);
        $unknown = array_values(array_diff($used, array_keys($variables)));

        if ($unknown !== []) {
            throw new UnknownContractVariableException($unknown, array_keys($variables));
        }

        return preg_replace_callback(
            '/\{\{\s*([a-z_]+\.[a-z_]+)\s*\}\}/i',
            fn (array $m) => $variables[$m[1]],
            $body
        );
    }

    /**
     * Checks a body without needing a lease — used when the agency saves a
     * clause, so a typo surfaces while they are still editing it rather than
     * months later on a real contract.
     *
     * @return array<int, string>
     */
    public function unknownVariablesIn(string $body): array
    {
        preg_match_all('/\{\{\s*([a-z_]+\.[a-z_]+)\s*\}\}/i', $body, $matches);

        return array_values(array_diff(array_unique($matches[1]), $this->available()));
    }

    private function money(int $amount): string
    {
        return number_format($amount, 0, ',', ' ').' FCFA';
    }

    private function number(float $value): string
    {
        return rtrim(rtrim(number_format($value, 2, ',', ' '), '0'), ',');
    }
}
