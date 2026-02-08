<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>{{ $installment->reference }}</title>
    <style>
        /* A one-month receipt belongs on one page: tightened until it does. */
        @page { margin: 16mm 18mm; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; line-height: 1.4; color: #1a1a1a; }
        h1 { font-size: 14pt; text-align: center; margin: 0 0 3px; text-transform: uppercase; letter-spacing: .5px; }
        .reference { text-align: center; font-size: 9pt; color: #555; margin-bottom: 16px; }
        h2 { font-size: 11pt; margin: 13px 0 5px; padding-bottom: 3px; border-bottom: 1px solid #999; }
        p { margin: 0 0 8px; text-align: justify; }
        table.terms { width: 100%; border-collapse: collapse; margin-bottom: 6px; page-break-inside: avoid; }
        table.terms td { padding: 4px 6px; border-bottom: 1px solid #e0e0e0; vertical-align: top; }
        table.terms td.label { width: 45%; color: #555; }
        table.terms td.value { font-weight: bold; }
        table.split { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.split th { text-align: left; font-size: 9pt; color: #555; padding: 4px 6px; border-bottom: 1px solid #999; }
        table.split td { padding: 4px 6px; border-bottom: 1px solid #e8e8e8; font-size: 9.5pt; }
        .total { margin-top: 10px; padding: 7px 10px; background: #f2f2f2; font-size: 11.5pt; font-weight: bold; }
        /* The heading and its box are one thing; split, the page above ends on
           a promise the page below fulfils. */
        .stamp { margin-top: 18px; page-break-inside: avoid; }
        .sign-box { border: 1px solid #999; height: 62px; width: 45%; margin-top: 5px; }
        .notice { margin-top: 16px; padding-top: 6px; border-top: 1px solid #ccc; font-size: 8pt; color: #666; }
    </style>
</head>
<body>

<h1>Quittance de loyer</h1>
<p class="reference">
    {{ $installment->reference }} — bail {{ $lease->reference }} — éditée le {{ now()->format('d/m/Y') }}
</p>

<p>
    L'agence <strong>{{ $lease->agency?->company_name }}</strong>, agissant pour le compte du
    bailleur, reconnaît avoir reçu de <strong>{{ $lease->tenant?->name }}</strong> la somme
    ci-dessous, au titre du loyer et des charges du bien
    « {{ $lease->property?->name }} », {{ $lease->property?->city }}.
</p>

<h2>Période quittancée</h2>
<table class="terms">
    <tr><td class="label">Du</td><td class="value">{{ $installment->period_start?->format('d/m/Y') }}</td></tr>
    <tr><td class="label">Au</td><td class="value">{{ $installment->period_end?->format('d/m/Y') }}</td></tr>
    <tr><td class="label">Échéance</td><td class="value">{{ $installment->due_date?->format('d/m/Y') }}</td></tr>
</table>

<h2>Détail</h2>
<table class="terms">
    <tr><td class="label">Loyer</td><td class="value">{{ $money($installment->rent_amount) }}</td></tr>
    <tr><td class="label">Charges</td><td class="value">{{ $money($installment->charges_amount) }}</td></tr>
</table>

<div class="total">Total réglé : {{ $money($installment->paid_amount) }}</div>

@if ($payments->isNotEmpty())
    <h2>Règlements imputés</h2>
    <table class="split">
        <tr>
            <th>Date</th>
            <th>Mode</th>
            <th>Encaissé par</th>
            <th style="text-align: right;">Montant</th>
        </tr>
        @foreach ($payments as $payment)
            <tr>
                <td>{{ ($payment->validated_at ?? $payment->created_at)?->format('d/m/Y') }}</td>
                <td>{{ $payment->method?->label() }}</td>
                <td>{{ $payment->validator?->name ?? '—' }}</td>
                <td style="text-align: right;">{{ $money($payment->pivot->applied_amount) }}</td>
            </tr>
        @endforeach
    </table>
@endif

<p style="margin-top: 12px;">
    Cette quittance annule et remplace tout reçu provisoire délivré pour la même période. Elle ne
    vaut pas quittance des périodes antérieures.
</p>

<div class="stamp">
    <strong>Pour l'agence</strong><br>
    <span style="font-size: 9pt; color: #555;">Cachet et signature</span>
    <div class="sign-box"></div>
</div>

<p class="notice">
    Document émis par la plateforme {{ config('app.name') }} pour le compte de l'agence
    {{ $lease->agency?->company_name }}.
</p>

</body>
</html>
