import API from '@/api/api'
import type { Agency } from '@/types/auth'

export interface ResubmitAgencyPayload {
  manager_name?: string
  description?: string
  address?: string
  city?: string
  activity_zone?: string
  phone?: string
}

export async function resubmitAgency(payload: ResubmitAgencyPayload): Promise<Agency> {
  const { data } = await API.post<{ data: Agency }>('/agency/resubmit', payload)
  return data.data
}
