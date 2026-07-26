<?php

namespace App\Enums;

/**
 * Lifecycle of a rental application.
 *
 * `Submitted`, `UnderReview`, `DocumentsRequested` and `Accepted` are the live
 * states: they are the ones the partial unique index counts when enforcing
 * "one active application per candidate and property" (RG-L05).
 */
enum RentalApplicationStatus: string
{
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case DocumentsRequested = 'documents_requested';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';

    /**
     * States that block a second application on the same property.
     *
     * @return array<int, string>
     */
    public static function activeValues(): array
    {
        return [
            self::Submitted->value,
            self::UnderReview->value,
            self::DocumentsRequested->value,
            self::Accepted->value,
        ];
    }

    public function isActive(): bool
    {
        return in_array($this->value, self::activeValues(), true);
    }

    /**
     * Can the agency still instruct this application?
     */
    public function isOpenToReview(): bool
    {
        return in_array($this, [self::Submitted, self::UnderReview, self::DocumentsRequested], true);
    }

    /**
     * Can the candidate still withdraw it?
     */
    public function isCancellable(): bool
    {
        return $this->isActive();
    }
}
