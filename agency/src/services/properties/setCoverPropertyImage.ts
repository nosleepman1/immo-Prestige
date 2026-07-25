import API from '@/api/api'
import type { PropertyImage } from '@/types/property'

export async function setCoverPropertyImage(imageId: number): Promise<PropertyImage> {
  const { data } = await API.put<{ data: PropertyImage }>(`/property-images/${imageId}/cover`)
  return data.data
}
