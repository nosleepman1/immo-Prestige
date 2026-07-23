<?php

namespace App\Actions\Agency;

use App\Models\Agency;

class UpdateAgency
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Agency $agency, array $data): Agency
    {
        $agency->update($data);

        return $agency;
    }
}
