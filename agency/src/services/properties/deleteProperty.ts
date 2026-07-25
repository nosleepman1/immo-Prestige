import API from '@/api/api'

export async function deleteProperty(id: number): Promise<void> {
  await API.delete(`/properties/${id}`)
}
