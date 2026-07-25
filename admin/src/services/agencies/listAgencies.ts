import API from '@/api/api'
import type { Agency, AgencyStatus } from '@/types/auth'

export async function listAgencies(status?: AgencyStatus): Promise<Agency[]> {
  const { data } = await API.get<{ data: Agency[] }>('/admin/agencies', {
    params: status ? { status } : undefined,
  })
  return data.data
}
