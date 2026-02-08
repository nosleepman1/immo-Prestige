import API from '@/api/api'
import type { Agency } from '@/types/auth'

export async function refuseAgency(id: number, reason: string): Promise<Agency> {
  const { data } = await API.post<{ data: Agency }>(`/admin/agencies/${id}/refuse`, { reason })
  return data.data
}
