import API from '@/api/api'
import type { Property, PropertySearchFilters } from '@/types/property'

export interface PropertiesPage {
  data: Property[]
  meta?: { current_page: number; last_page: number }
}

export async function searchProperties(filters: PropertySearchFilters, page = 1): Promise<PropertiesPage> {
  const { data } = await API.get<PropertiesPage>('/properties', { params: { ...filters, page } })
  return data
}
