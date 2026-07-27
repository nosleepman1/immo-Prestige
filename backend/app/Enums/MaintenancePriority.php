<?php

namespace App\Enums;

/**
 * How fast the agency should look at it.
 *
 * Declared by the tenant, who is the one living with the problem, and
 * adjustable by the agency, who is the one who knows what a leak costs if it
 * waits.
 */
enum MaintenancePriority: string
{
    case Low = 'low';
    case Normal = 'normal';
    case High = 'high';
    case Urgent = 'urgent';

    public function label(): string
    {
        return match ($this) {
            self::Low => 'Basse',
            self::Normal => 'Normale',
            self::High => 'Haute',
            self::Urgent => 'Urgente',
        };
    }
}
