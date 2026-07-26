import API from '@/api/api'

export async function deletePropertyImage(imageId: number): Promise<void> {
  await API.delete(`/property-images/${imageId}`)
}
