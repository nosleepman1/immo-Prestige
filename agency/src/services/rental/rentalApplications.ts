import API from '@/api/api'
import type { RentalApplication, RentalApplicationStatus } from '@/types/rental'

export async function listRentalApplications(
  status?: RentalApplicationStatus
): Promise<RentalApplication[]> {
  const { data } = await API.get<{ data: RentalApplication[] }>('/agency/rental-applications', {
    params: status ? { status } : undefined,
  })
  return data.data
}

export async function getRentalApplication(id: number): Promise<RentalApplication> {
  const { data } = await API.get<{ data: RentalApplication }>(`/agency/rental-applications/${id}`)
  return data.data
}

export async function acceptRentalApplication(id: number): Promise<RentalApplication> {
  const { data } = await API.post<{ data: RentalApplication }>(
    `/agency/rental-applications/${id}/accept`
  )
  return data.data
}

export async function rejectRentalApplication(
  id: number,
  rejection_reason: string
): Promise<RentalApplication> {
  const { data } = await API.post<{ data: RentalApplication }>(
    `/agency/rental-applications/${id}/reject`,
    { rejection_reason }
  )
  return data.data
}

export async function requestApplicationDocuments(
  id: number,
  requested_documents: string
): Promise<RentalApplication> {
  const { data } = await API.post<{ data: RentalApplication }>(
    `/agency/rental-applications/${id}/request-documents`,
    { requested_documents }
  )
  return data.data
}
