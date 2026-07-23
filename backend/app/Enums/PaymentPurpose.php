<?php

namespace App\Enums;

enum PaymentPurpose: string
{
    case Subscription = 'subscription';
    case VerificationBadge = 'verification_badge';
}
