import API from '@/api/api'
import type { PropertyImage } from '@/types/property'

export async function reorderPropertyImages(propertyId: number, imageIds: number[]): Promise<PropertyImage[]> {
  const { data } = await API.put<{ data: PropertyImage[] }>(`/properties/${propertyId}/images/order`, {
    image_ids: imageIds,
  })
  return data.data
}
