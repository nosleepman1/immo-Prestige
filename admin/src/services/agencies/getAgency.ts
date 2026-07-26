import API from '@/api/api'
import type { Agency } from '@/types/auth'

export async function getAgency(id: number): Promise<Agency> {
  const { data } = await API.get<{ data: Agency }>(`/admin/agencies/${id}`)
  return data.data
}
