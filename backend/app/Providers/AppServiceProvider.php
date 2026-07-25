<?php

namespace App\Providers;

use App\Events\AgencyActivated;
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
use Illuminate\Support\Facades\Event;
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
    }
}
