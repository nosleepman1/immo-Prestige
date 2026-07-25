import axios from 'axios'
import type { HealthStatus } from '@/types/health'

// The healthcheck lives outside /api/v1 (infra probes target it directly),
// so it can't go through the versioned `API` axios instance.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const ROOT_URL = API_URL.replace(/\/api\/v1\/?$/, '')

export async function getHealth(): Promise<HealthStatus> {
  const { data } = await axios.get<HealthStatus>(`${ROOT_URL}/api/health`, {
    validateStatus: (status) => status === 200 || status === 503,
  })
  return data
}
