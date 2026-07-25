import API from '@/api/api'
import type { Property, PropertyFormValues } from '@/types/property'

export async function createProperty(payload: PropertyFormValues): Promise<Property> {
  const { data } = await API.post<{ data: Property }>('/properties', payload)
  return data.data
}
