<?php

namespace App\Payments;

readonly class GatewayInvoice
{
    public function __construct(
        public string $token,
        public string $redirectUrl,
    ) {}
}
