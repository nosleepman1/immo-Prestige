<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>{{ $lease->reference }}</title>
    <style>
        @page { margin: 25mm 20mm; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10.5pt; line-height: 1.5; color: #1a1a1a; }
        h1 { font-size: 15pt; text-align: center; margin: 0 0 4px; text-transform: uppercase; letter-spacing: .5px; }
        .reference { text-align: center; font-size: 9.5pt; color: #555; margin-bottom: 22px; }
        h2 { font-size: 11.5pt; margin: 20px 0 8px; padding-bottom: 3px; border-bottom: 1px solid #999; }
        h3 { font-size: 10.5pt; margin: 14px 0 4px; }
        p { margin: 0 0 8px; text-align: justify; }
        /* A block of figures split across two pages reads as two half-truths;
           dompdf honours this on the table as a whole. */
        table.terms { width: 100%; border-collapse: collapse; margin-bottom: 6px; page-break-inside: avoid; }
        h2 { page-break-after: avoid; }
        h3 { page-break-after: avoid; }
        table.terms td { padding: 4px 6px; border-bottom: 1px solid #e0e0e0; vertical-align: top; }
        table.terms td.label { width: 42%; color: #555; }
        table.terms td.value { font-weight: bold; }
        .signatures { width: 100%; margin-top: 34px; }
        .signatures td { width: 50%; padding-top: 6px; vertical-align: top; }
        .sign-box { border: 1px solid #999; height: 90px; margin-top: 6px; }
        .notice { margin-top: 26px; padding-top: 8px; border-top: 1px solid #ccc; font-size: 8.5pt; color: #666; }
        .made-at { margin-top: 22px; }
    </style>
</head>
<body>

<h1>Contrat de bail à usage d'habitation</h1>
<p class="reference">Référence {{ $lease->reference }} — établi le {{ now()->format('d/m/Y') }}</p>

<h2>Article préliminaire — Les parties</h2>
<p>
    <strong>Le bailleur</strong> : {{ $v['proprietaire.nom'] }},
    représenté par l'agence {{ $v['agence.nom'] }}, dont le siège est situé {{ $v['agence.adresse'] }}.
</p>
<p>
    <strong>Le preneur</strong> : {{ $v['locataire.nom'] }},
    titulaire de la pièce d'identité n° {{ $v['locataire.piece_identite'] }}.
</p>

<h2>Désignation du bien loué</h2>
<table class="terms">
    <tr><td class="label">Désignation</td><td class="value">{{ $v['bien.designation'] }}</td></tr>
    <tr><td class="label">Adresse</td><td class="value">{{ $v['bien.adresse'] }}</td></tr>
    <tr><td class="label">Superficie</td><td class="value">{{ $v['bien.surface'] }}</td></tr>
    <tr><td class="label">Nombre de pièces</td><td class="value">{{ $lease->property?->rooms }}</td></tr>
    <tr><td class="label">Meublé</td><td class="value">{{ $lease->property?->furnished ? 'Oui' : 'Non' }}</td></tr>
</table>

<h2>Durée du bail</h2>
<table class="terms">
    <tr><td class="label">Date de prise d'effet</td><td class="value">{{ $v['bail.date_debut'] }}</td></tr>
    <tr><td class="label">Date d'échéance</td><td class="value">{{ $v['bail.date_fin'] }}</td></tr>
    <tr><td class="label">Durée</td><td class="value">{{ $v['bail.duree_mois'] }} mois</td></tr>
    <tr><td class="label">Préavis de résiliation</td><td class="value">{{ $v['bail.preavis_jours'] }} jours</td></tr>
</table>

<h2>Loyer, charges et garanties</h2>
<table class="terms">
    <tr><td class="label">Loyer mensuel</td><td class="value">{{ $v['bail.loyer'] }}</td></tr>
    <tr><td class="label">Charges mensuelles</td><td class="value">{{ $v['bail.charges'] }}</td></tr>
    <tr><td class="label">Total mensuel dû</td><td class="value">{{ $monthlyTotal }}</td></tr>
    <tr><td class="label">Dépôt de garantie</td><td class="value">{{ $v['bail.caution'] }}</td></tr>
    <tr><td class="label">Mois d'avance</td><td class="value">{{ $v['bail.mois_avance'] }}</td></tr>
    <tr><td class="label">Versement initial exigible</td><td class="value">{{ $initialPayment }}</td></tr>
</table>

<h2>Modalités de paiement</h2>
<p>
    Le loyer et les charges sont exigibles le {{ $v['bail.jour_echeance'] }} de chaque mois,
    selon une périodicité {{ $periodicity }}. Le preneur peut s'acquitter d'une ou de plusieurs
    échéances en une seule fois. Chaque règlement donne lieu à la délivrance d'une quittance.
</p>

@if ($clauses->isNotEmpty())
    <h2>Clauses particulières</h2>
    @foreach ($clauses as $index => $clause)
        <h3>Article {{ $index + 1 }} — {{ $clause['title'] }}</h3>
        @foreach (preg_split('/\r\n|\r|\n/', $clause['body']) as $paragraph)
            @if (trim($paragraph) !== '')
                <p>{{ $paragraph }}</p>
            @endif
        @endforeach
    @endforeach
@endif

<p class="made-at">
    Fait à {{ $lease->property?->city }}, en deux exemplaires originaux,
    le {{ now()->format('d/m/Y') }}.
</p>

<table class="signatures">
    <tr>
        <td>
            <strong>Le bailleur</strong><br>
            <span style="font-size: 9pt; color: #555;">Lu et approuvé</span>
            <div class="sign-box"></div>
        </td>
        <td>
            <strong>Le preneur</strong><br>
            <span style="font-size: 9pt; color: #555;">Lu et approuvé</span>
            <div class="sign-box"></div>
        </td>
    </tr>
</table>

<p class="notice">
    Document assemblé par la plateforme {{ config('app.name') }} à partir des clauses rédigées
    par l'agence {{ $v['agence.nom'] }}. La plateforme ne fournit pas de conseil juridique et
    n'est pas partie au présent contrat.
</p>

</body>
</html>
