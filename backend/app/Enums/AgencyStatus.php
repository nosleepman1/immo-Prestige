<?php

namespace App\Enums;

enum AgencyStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Refused = 'refused';
}
