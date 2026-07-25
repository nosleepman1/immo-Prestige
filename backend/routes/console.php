<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('subscriptions:expire')->dailyAt('02:00');

// Fires QueueBusy (see AppServiceProvider -> LogBusyQueue) when a queue's
// pending count crosses the threshold.
Schedule::command('queue:monitor default,emails,media --max=100')->everyFiveMinutes();

Schedule::command('accounts:anonymize')->dailyAt('03:00');
