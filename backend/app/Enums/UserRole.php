<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Agency = 'agency';
    case User = 'user';
}
