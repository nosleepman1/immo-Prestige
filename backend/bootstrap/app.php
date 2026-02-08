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

        // No login page to send anyone to. The builder's default guest redirect
        // resolves route('login') eagerly, which blows up before the 401 is even
        // raised; returning null keeps it an authentication failure, and
        // shouldRenderJsonWhen below turns it into a plain JSON 401.
        $middleware->redirectGuestsTo(fn () => null);

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Stateless API with no login page to redirect to. Without this, an
        // unauthenticated request that does not announce Accept: json — a file
        // download opened straight in a browser tab, typically — sends the
        // handler looking for a `login` route and yields a 500 instead of a
        // plain 401.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson()
        );

        // Business exceptions render as { message, code } with their own status.
        // Framework exceptions (401/403/404/422/429) keep Laravel's JSON shape.
        $exceptions->render(function (DomainException $e, Request $request) {
            return response()->json([
                'message' => $e->getMessage(),
                'code' => $e->errorCode,
            ], $e->status);
        });
    })->create();
