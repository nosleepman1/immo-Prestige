import API from '@/api/api'
import type { Property, PropertyFormValues } from '@/types/property'

export async function updateProperty(id: number, payload: Partial<PropertyFormValues>): Promise<Property> {
  const { data } = await API.put<{ data: Property }>(`/properties/${id}`, payload)
  return data.data
}
