import API from '@/api/api'
import type { Owner, OwnerFormValues } from '@/types/rental'

export async function listOwners(): Promise<Owner[]> {
  const { data } = await API.get<{ data: Owner[] }>('/agency/owners')
  return data.data
}

export async function createOwner(values: OwnerFormValues): Promise<Owner> {
  const { data } = await API.post<{ data: Owner }>('/agency/owners', values)
  return data.data
}

export async function updateOwner(id: number, values: Partial<OwnerFormValues>): Promise<Owner> {
  const { data } = await API.put<{ data: Owner }>(`/agency/owners/${id}`, values)
  return data.data
}

export async function deleteOwner(id: number): Promise<void> {
  await API.delete(`/agency/owners/${id}`)
}
