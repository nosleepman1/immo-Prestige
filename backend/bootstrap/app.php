<?php

use App\Exceptions\DomainException;
use App\Http\Middleware\EnsureActiveSubscription;
use App\Http\Middleware\EnsurePasswordIsSet;
use App\Http\Middleware\EnsureRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    // Stateless API: the broadcasting auth endpoint must use the sanctum
    // guard, not Laravel's session-based 'web' default.
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['middleware' => ['auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => EnsureRole::class,
            'password.set' => EnsurePasswordIsSet::class,
            'subscription.active' => EnsureActiveSubscription::class,
        ]);

        // Default ceiling on every API route (see RateLimiter::for('api', ...));
        // specific routes layer a tighter limiter (login/register/messages/reports).
        $middleware->throttleApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Business exceptions render as { message, code } with their own status.
        // Framework exceptions (401/403/404/422/429) keep Laravel's JSON shape.
        $exceptions->render(function (DomainException $e, Request $request) {
            return response()->json([
                'message' => $e->getMessage(),
                'code' => $e->errorCode,
            ], $e->status);
        });
    })->create();
