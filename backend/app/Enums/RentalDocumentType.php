<?php

namespace App\Enums;

enum RentalDocumentType: string
{
    case IdentityDocument = 'identity_document';
    case ProofOfIncome = 'proof_of_income';
    case EmploymentLetter = 'employment_letter';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::IdentityDocument => "Pièce d'identité",
            self::ProofOfIncome => 'Justificatif de revenus',
            self::EmploymentLetter => 'Attestation de travail',
            self::Other => 'Autre document',
        };
    }
}
