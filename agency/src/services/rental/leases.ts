import API from '@/api/api'
import type { GenerateLeaseValues, Lease, LeaseInstallment } from '@/types/rental'

export async function listLeases(status?: string): Promise<Lease[]> {
  const { data } = await API.get<{ data: Lease[] }>('/agency/leases', {
    params: status ? { status } : undefined,
  })
  return data.data
}

export async function getLease(id: number): Promise<Lease> {
  const { data } = await API.get<{ data: Lease }>(`/agency/leases/${id}`)
  return data.data
}

export async function generateLease(
  applicationId: number,
  values: GenerateLeaseValues
): Promise<Lease> {
  const { data } = await API.post<{ data: Lease }>(
    `/agency/rental-applications/${applicationId}/generate-lease`,
    values
  )
  return data.data
}

export async function validateSignature(leaseId: number): Promise<Lease> {
  const { data } = await API.post<{ data: Lease }>(`/agency/leases/${leaseId}/validate-signature`)
  return data.data
}

export async function rejectSignature(leaseId: number, reason: string): Promise<Lease> {
  const { data } = await API.post<{ data: Lease }>(`/agency/leases/${leaseId}/reject-signature`, {
    reason,
  })
  return data.data
}

export async function listLeaseInstallments(leaseId: number): Promise<LeaseInstallment[]> {
  const { data } = await API.get<{ data: LeaseInstallment[] }>(`/leases/${leaseId}/installments`)
  return data.data
}

export async function recordCashPayment(
  leaseId: number,
  installment_ids: number[],
  amount: number
): Promise<{ payment_id: number; amount: number; recorded_by: string; recorded_at: string }> {
  const { data } = await API.post(`/agency/leases/${leaseId}/record-cash-payment`, {
    installment_ids,
    amount,
  })
  return data
}

export async function recordCashInitialPayment(
  leaseId: number
): Promise<{ payment_id: number; amount: number; lease_status: string }> {
  const { data } = await API.post(`/agency/leases/${leaseId}/record-cash-initial`)
  return data
}

export interface LedgerFilters {
  status?: string
  lease_id?: number
  month?: string
  late_only?: boolean
}

export async function listLedger(filters: LedgerFilters): Promise<LeaseInstallment[]> {
  const { data } = await API.get<{ data: LeaseInstallment[] }>('/agency/installments', {
    params: filters,
  })
  return data.data
}

/**
 * Both documents live on a private disk: they are fetched as blobs through the
 * authenticated client rather than linked to, which a plain href could not do.
 */
export async function downloadLeaseDocument(
  leaseId: number,
  kind: 'contract' | 'signed-contract'
): Promise<Blob> {
  const { data } = await API.get(`/leases/${leaseId}/${kind}`, { responseType: 'blob' })
  return data
}

export async function downloadReceipt(installmentId: number): Promise<Blob> {
  const { data } = await API.get(`/installments/${installmentId}/receipt`, {
    responseType: 'blob',
  })
  return data
}
