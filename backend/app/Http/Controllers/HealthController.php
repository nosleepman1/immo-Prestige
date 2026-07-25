<?php

namespace App\Http\Controllers;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    /**
     * Beyond Laravel's default `/up` (a bare boot check), this verifies the
     * dependencies the API actually needs at runtime: database, cache/queue
     * backing store, and the failed-jobs backlog.
     */
    public function check(): JsonResponse
    {
        $checks = [
            'database' => $this->probe(fn () => DB::connection()->getPdo() && true),
            'cache' => $this->probe(function () {
                Cache::put('health:check', true, 5);

                return Cache::get('health:check') === true;
            }),
            'failed_jobs' => $this->probe(function () {
                $count = DB::table('failed_jobs')->count();

                return $count < 50 ? true : "backlog: {$count}";
            }),
        ];

        $healthy = collect($checks)->every(fn ($check) => $check['ok']);

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }

    /**
     * @return array{ok: bool, detail?: string}
     */
    private function probe(Closure $probe): array
    {
        try {
            $result = $probe();

            return $result === true ? ['ok' => true] : ['ok' => false, 'detail' => (string) $result];
        } catch (Throwable $e) {
            return ['ok' => false, 'detail' => $e->getMessage()];
        }
    }
}
