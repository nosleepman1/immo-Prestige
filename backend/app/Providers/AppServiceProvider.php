<?php

namespace App\Providers;

use App\Events\RegisterUser;
use App\Events\UserRegistered;
use App\Listeners\RegisterUserListener;
use App\Listeners\UserRegisteredListener;
use App\Models\Agency;
use App\Policies\AgencyPolicy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate as FacadesGate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(
            UserRegistered::class,
            UserRegisteredListener::class
        );
    }
}
