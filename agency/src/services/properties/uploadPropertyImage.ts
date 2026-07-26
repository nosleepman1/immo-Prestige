import API from '@/api/api'
import type { PropertyImage } from '@/types/property'

export async function uploadPropertyImage(propertyId: number, file: File): Promise<PropertyImage> {
  const form = new FormData()
  form.append('image', file)

  const { data } = await API.post<{ data: PropertyImage }>(`/properties/${propertyId}/images`, form)
  return data.data
}
