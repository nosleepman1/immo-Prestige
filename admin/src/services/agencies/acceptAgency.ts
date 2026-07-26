import API from '@/api/api'
import type { Agency } from '@/types/auth'

export async function acceptAgency(id: number): Promise<Agency> {
  const { data } = await API.post<{ data: Agency }>(`/admin/agencies/${id}/accept`)
  return data.data
}
