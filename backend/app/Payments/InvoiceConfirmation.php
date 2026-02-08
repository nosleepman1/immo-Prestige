<?php

namespace App\Payments;

/**
 * Authoritative invoice state re-fetched from the provider (never trusted from
 * the IPN body). `amount` is in XOF integer units.
 */
readonly class InvoiceConfirmation
{
    public function __construct(
        public bool $found,
        public bool $completed,
        public ?int $amount = null,
    ) {}

    public static function notFound(): self
    {
        return new self(found: false, completed: false);
    }
}
