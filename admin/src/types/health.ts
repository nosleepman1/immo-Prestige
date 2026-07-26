export interface HealthCheck {
  ok: boolean
  detail?: string
}

export interface HealthStatus {
  status: 'ok' | 'degraded'
  checks: {
    database: HealthCheck
    cache: HealthCheck
    failed_jobs: HealthCheck
  }
}
