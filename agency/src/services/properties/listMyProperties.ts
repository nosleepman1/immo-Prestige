import API from '@/api/api'
import type { Property } from '@/types/property'

export async function listMyProperties(): Promise<Property[]> {
  const { data } = await API.get<{ data: Property[] }>('/properties/mine')
  return data.data
}
