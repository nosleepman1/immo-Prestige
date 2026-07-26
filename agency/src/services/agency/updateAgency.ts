import API from '@/api/api'
import type { Agency } from '@/types/auth'

export interface UpdateAgencyPayload {
  company_name?: string
  description?: string
  address?: string
  city?: string
  phone?: string
  id_card?: string
}

export async function updateAgency(id: number, payload: UpdateAgencyPayload): Promise<Agency> {
  const { data } = await API.put<{ data: Agency }>(`/agency/${id}`, payload)
  return data.data
}
