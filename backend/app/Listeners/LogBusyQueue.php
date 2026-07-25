<?php

namespace App\Listeners;

use Illuminate\Queue\Events\QueueBusy;
use Illuminate\Support\Facades\Log;

/**
 * Fired by `queue:monitor` (scheduled, see routes/console.php) when a queue's
 * pending job count crosses the configured threshold.
 */
class LogBusyQueue
{
    public function handle(QueueBusy $event): void
    {
        Log::channel('business')->warning('Queue backlog threshold exceeded', [
            'connection' => $event->connection,
            'queue' => $event->queue,
            'size' => $event->size,
        ]);
    }
}
