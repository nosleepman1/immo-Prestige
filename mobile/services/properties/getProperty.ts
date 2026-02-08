import API from '@/api/api'
import type { Property } from '@/types/property'

export async function getProperty(id: number): Promise<Property> {
  const { data } = await API.get<{ data: Property }>(`/properties/${id}`)
  return data.data
}
