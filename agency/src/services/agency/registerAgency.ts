import API from '@/api/api'
import type { Agency } from '@/types/auth'

export interface RegisterAgencyPayload {
  company_name: string
  manager_name: string
  description: string
  address: string
  city: string
  activity_zone?: string
  phone: string
  email: string
  id_card: string
  id_card_document: File
  business_registry_document: File
  proof_of_address_document?: File
}

export interface RegisterAgencyResult {
  agency: Agency
  access_token: string
}

export async function registerAgency(payload: RegisterAgencyPayload): Promise<RegisterAgencyResult> {
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value as string | Blob)
  })

  const { data } = await API.post<{ data: RegisterAgencyResult }>('/agency/register', form)
  return data.data
}
