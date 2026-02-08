import API from '@/api/api'
import type { Property } from '@/types/property'

export async function publishProperty(id: number): Promise<Property> {
  const { data } = await API.post<{ data: Property }>(`/properties/${id}/publish`)
  return data.data
}
