<?php

namespace App\Actions\Agency;

use App\Models\Agency;

class DeleteAgency
{
    public function handle(Agency $agency): void
    {
        $agency->delete();
    }
}
