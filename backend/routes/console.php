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

// Rental ledger, in the order the day's facts depend on each other: create the
// months first, warn about the ones coming due, then rule on the ones that
// passed. Run the other way round, a month created today could be declared late
// the same morning.
Schedule::command('rentals:generate-installments')->dailyAt('04:00');
Schedule::command('rentals:notify-due-soon')->dailyAt('08:00');
Schedule::command('rentals:mark-late')->dailyAt('08:30');
