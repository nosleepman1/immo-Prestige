import API from '@/api/api'
import type { Agency } from '@/types/auth'

export async function getMyAgency(): Promise<Agency> {
  const { data } = await API.get<{ data: Agency }>('/agency/me')
  return data.data
}
