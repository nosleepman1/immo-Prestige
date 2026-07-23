<?php

namespace App\Http\Middleware;

use App\Exceptions\PasswordNotSetException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks an agency account that has not defined its password yet (created in
 * `pending` state) from anything but viewing its own status and setting its
 * password. Returns PASSWORD_NOT_SET so the client can redirect.
 */
class EnsurePasswordIsSet
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isAgency() && $user->password === null) {
            throw new PasswordNotSetException();
        }

        return $next($request);
    }
}
