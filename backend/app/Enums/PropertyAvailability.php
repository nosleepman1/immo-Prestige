<?php

namespace App\Enums;

/**
 * Commercial availability of a property, replacing the former `sold` boolean
 * which could not express "rented" nor "reserved".
 *
 * Distinct from PropertyStatus, which is the editorial lifecycle
 * (draft / published / archived). A property can be published and rented.
 */
enum PropertyAvailability: string
{
    case Available = 'available';
    case Reserved = 'reserved';
    case Sold = 'sold';
    case Rented = 'rented';

    /**
     * Can a new rental application or sale enquiry still be taken?
     */
    public function isOpen(): bool
    {
        return $this === self::Available;
    }
}
