<?php

namespace App\Enums;

/**
 * Lifecycle of a maintenance ticket.
 *
 * `Acknowledged` exists on purpose between Open and InProgress: a tenant whose
 * report has been seen but not yet acted on is in a different position from one
 * whose report is still unread, and telling them so costs nothing.
 */
enum MaintenanceStatus: string
{
    case Open = 'open';
    case Acknowledged = 'acknowledged';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Closed = 'closed';
    case Rejected = 'rejected';

    /** Still being worked on: the thread accepts messages. */
    public function isLive(): bool
    {
        return ! in_array($this, [self::Closed, self::Rejected], true);
    }

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Ouvert',
            self::Acknowledged => 'Pris en compte',
            self::InProgress => 'En cours',
            self::Resolved => 'Résolu',
            self::Closed => 'Clos',
            self::Rejected => 'Rejeté',
        };
    }
}
