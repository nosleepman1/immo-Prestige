import API from '@/api/api'
import type { PropertyType, Devise } from '@/types/property'

export async function listPropertyTypes(): Promise<PropertyType[]> {
  const { data } = await API.get<{ data: PropertyType[] }>('/property-types')
  return data.data
}

export async function listDevises(): Promise<Devise[]> {
  const { data } = await API.get<{ data: Devise[] }>('/devises')
  return data.data
}
