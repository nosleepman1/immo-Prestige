<?php

namespace App\Providers;

use App\Models\Agency;
use App\Policies\AgencyPolicy;
use Illuminate\Auth\Access\Gate;
use Illuminate\Support\Facades\Gate as FacadesGate;
use Illuminate\Support\ServiceProvider;

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
        FacadesGate::policy(Agency::class, AgencyPolicy::class);
    }
}