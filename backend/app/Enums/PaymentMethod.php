<?php

namespace App\Enums;

/**
 * How money actually reached the agency.
 *
 * `Cash` exists because it is how most rent is paid in Dakar. It is not a
 * lesser case: RG-L19 makes every cash receipt carry the name of the agent who
 * took it and the moment they did, and neither can be edited afterwards.
 */
enum PaymentMethod: string
{
    case PayDunya = 'paydunya';
    case Cash = 'cash';

    public function label(): string
    {
        return match ($this) {
            self::PayDunya => 'En ligne (PayDunya)',
            self::Cash => 'Espèces',
        };
    }
}
