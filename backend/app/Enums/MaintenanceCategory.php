<?php

namespace App\Enums;

enum MaintenanceCategory: string
{
    case Plumbing = 'plumbing';
    case Electrical = 'electrical';
    case Structure = 'structure';
    case Appliance = 'appliance';
    case Security = 'security';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Plumbing => 'Plomberie',
            self::Electrical => 'Électricité',
            self::Structure => 'Structure',
            self::Appliance => 'Équipement',
            self::Security => 'Sécurité',
            self::Other => 'Autre',
        };
    }
}
