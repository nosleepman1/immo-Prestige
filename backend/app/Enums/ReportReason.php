<?php

namespace App\Enums;

enum ReportReason: string
{
    case Spam = 'spam';
    case Abusive = 'abusive';
    case Inappropriate = 'inappropriate';
    case Other = 'other';
}
