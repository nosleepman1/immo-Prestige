<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_reports_healthy_when_dependencies_are_up(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('checks.database.ok', true)
            ->assertJsonPath('checks.cache.ok', true)
            ->assertJsonPath('checks.failed_jobs.ok', true);
    }

    public function test_it_reports_degraded_when_the_failed_jobs_backlog_is_large(): void
    {
        \Illuminate\Support\Facades\DB::table('failed_jobs')->insert(
            array_map(fn () => [
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'connection' => 'redis',
                'queue' => 'default',
                'payload' => '{}',
                'exception' => 'boom',
                'failed_at' => now(),
            ], range(1, 51))
        );

        $this->getJson('/api/health')
            ->assertStatus(503)
            ->assertJsonPath('status', 'degraded')
            ->assertJsonPath('checks.failed_jobs.ok', false);
    }
}
