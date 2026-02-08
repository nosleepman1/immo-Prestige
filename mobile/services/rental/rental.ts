import API from '@/api/api'
import type {
  AppNotification,
  Lease,
  LeaseInstallment,
  RentalApplication,
  RentalApplicationPayload,
} from '@/types/rental'

// ─── Applications ────────────────────────────────────────────────────────────

export async function submitRentalApplication(
  payload: RentalApplicationPayload
): Promise<RentalApplication> {
  const { data } = await API.post<{ data: RentalApplication }>('/rental-applications', payload)
  return data.data
}

export async function listMyApplications(): Promise<RentalApplication[]> {
  const { data } = await API.get<{ data: RentalApplication[] }>('/rental-applications/mine')
  return data.data
}

export async function getMyApplication(id: number): Promise<RentalApplication> {
  const { data } = await API.get<{ data: RentalApplication }>(`/rental-applications/${id}`)
  return data.data
}

export async function cancelApplication(id: number): Promise<RentalApplication> {
  const { data } = await API.delete<{ data: RentalApplication }>(`/rental-applications/${id}`)
  return data.data
}

/**
 * Supporting documents go up as multipart; the client's JSON default header has
 * to be dropped or the boundary never reaches the server.
 */
export async function uploadApplicationDocument(
  applicationId: number,
  file: { uri: string; name: string; type: string },
  documentType: string
) {
  const form = new FormData()
  form.append('type', documentType)
  form.append('file', file as unknown as Blob)

  const { data } = await API.post(`/rental-applications/${applicationId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

// ─── Leases ──────────────────────────────────────────────────────────────────

export async function listMyLeases(): Promise<Lease[]> {
  const { data } = await API.get<{ data: Lease[] }>('/leases/mine')
  return data.data
}

export async function getMyLease(id: number): Promise<Lease> {
  const { data } = await API.get<{ data: Lease }>(`/leases/${id}`)
  return data.data
}

export async function validateLeaseTerms(id: number): Promise<Lease> {
  const { data } = await API.post<{ data: Lease }>(`/leases/${id}/validate`)
  return data.data
}

export async function uploadSignedContract(
  leaseId: number,
  file: { uri: string; name: string; type: string }
): Promise<Lease> {
  const form = new FormData()
  form.append('file', file as unknown as Blob)

  const { data } = await API.post<{ data: Lease }>(`/leases/${leaseId}/signed-contract`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function listLeaseInstallments(leaseId: number): Promise<LeaseInstallment[]> {
  const { data } = await API.get<{ data: LeaseInstallment[] }>(`/leases/${leaseId}/installments`)
  return data.data
}

export async function checkoutInitialPayment(
  leaseId: number
): Promise<{ redirect_url: string; amount: number }> {
  const { data } = await API.post(`/leases/${leaseId}/initial-payment/checkout`)
  return data
}

export async function checkoutInstallments(
  leaseId: number,
  installment_ids: number[]
): Promise<{ redirect_url: string; amount: number }> {
  const { data } = await API.post(`/leases/${leaseId}/installments/checkout`, { installment_ids })
  return data
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function listNotifications(): Promise<{
  data: AppNotification[]
  unread_count: number
}> {
  const { data } = await API.get('/notifications')
  return { data: data.data, unread_count: data.meta?.unread_count ?? 0 }
}

export async function markNotificationRead(id: string): Promise<void> {
  await API.post(`/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await API.post('/notifications/read-all')
}
