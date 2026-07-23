<?php

namespace App\Providers;

use App\Events\AgencyActivated;
use App\Listeners\StartTrialSubscription;
use App\Payments\Contracts\PaymentGateway;
use App\Payments\FakePaymentGateway;
use App\Payments\PayDunyaGateway;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Event;
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
    }
}
