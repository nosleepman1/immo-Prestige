<?php

namespace App\Providers;

use App\Events\AgencyActivated;
use App\Listeners\LogBusyQueue;
use App\Listeners\LogFailedJob;
use App\Listeners\StartTrialSubscription;
use App\Models\Comment;
use App\Models\CommentReply;
use App\Models\Post;
use App\Payments\Contracts\PaymentGateway;
use App\Payments\FakePaymentGateway;
use App\Payments\PayDunyaGateway;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Queue\Events\QueueBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PaymentGateway::class, function ($app) {
            $config = $app['config']['services.paydunya'];

            return ($config['driver'] ?? 'paydunya') === 'fake'
                ? new FakePaymentGateway()
                : new PayDunyaGateway($config);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fail loudly on N+1 outside production. Policies are auto-discovered
        // (App\Policies\{Model}Policy).
        Model::preventLazyLoading(! $this->app->isProduction());

        Event::listen(AgencyActivated::class, StartTrialSubscription::class);
        Event::listen(JobFailed::class, LogFailedJob::class);
        Event::listen(QueueBusy::class, LogBusyQueue::class);

        // Short, stable aliases in reports.reportable_type instead of leaking
        // fully-qualified class names to API clients. Not enforced: Sanctum's
        // own tokenable morph is unrelated to this map and must keep resolving.
        Relation::morphMap([
            'comment' => Comment::class,
            'comment_reply' => CommentReply::class,
            'post' => Post::class,
        ]);

        RateLimiter::for('messages', fn ($request) => Limit::perMinute(20)->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('register', fn ($request) => Limit::perHour(5)->by($request->ip()));

        // Default ceiling for the whole API, keyed by user when authenticated
        // (each account gets its own budget) or by IP for guests.
        RateLimiter::for('api', fn ($request) => Limit::perMinute(120)->by($request->user()?->id ?: $request->ip()));

        // Brute-force protection: keyed by email+IP so one attacker can't lock
        // out a real account by spamming failed logins for a different IP.
        RateLimiter::for('login', fn ($request) => Limit::perMinute(5)->by(strtolower((string) $request->input('email')).'|'.$request->ip()));

        RateLimiter::for('reports', fn ($request) => Limit::perHour(10)->by($request->user()?->id ?: $request->ip()));

        // Scramble's docs route is open by default in APP_ENV=local; outside
        // that (staging/prod) it's closed unless explicitly opted into via env
        // — the API is stateless, so a session-based admin check doesn't apply.
        Gate::define('viewApiDocs', fn () => (bool) env('API_DOCS_PUBLIC', false));
    }
}
