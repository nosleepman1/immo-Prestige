import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  downloadLeaseDocument,
  downloadReceipt,
  generateLease,
  getLease,
  listLeaseInstallments,
  listLeases,
  listLedger,
  recordCashInitialPayment,
  recordCashPayment,
  rejectSignature,
  validateSignature,
  type LedgerFilters,
} from '@/services/rental/leases'
import { queryKeys } from '@/lib/queryKeys'
import type { GenerateLeaseValues } from '@/types/rental'

export function useLeases(status?: string) {
  return useQuery({ queryKey: queryKeys.leases.list(status), queryFn: () => listLeases(status) })
}

export function useLease(id: number) {
  return useQuery({
    queryKey: queryKeys.leases.detail(id),
    queryFn: () => getLease(id),
    enabled: Number.isFinite(id),
  })
}

export function useLeaseInstallments(leaseId: number) {
  return useQuery({
    queryKey: queryKeys.leases.installments(leaseId),
    queryFn: () => listLeaseInstallments(leaseId),
    enabled: Number.isFinite(leaseId),
  })
}

export function useLedger(filters: LedgerFilters) {
  return useQuery({
    queryKey: queryKeys.installments.ledger(filters),
    queryFn: () => listLedger(filters),
  })
}

export function useGenerateLease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, values }: { applicationId: number; values: GenerateLeaseValues }) =>
      generateLease(applicationId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] })
      queryClient.invalidateQueries({ queryKey: ['rental-applications'] })
    },
  })
}

export function useLeaseActions(leaseId: number) {
  const queryClient = useQueryClient()

  // A signature decision and a cash entry both change the lease and its
  // schedule; the ledger too, since it lists the same instalments.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leases.detail(leaseId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.leases.installments(leaseId) })
    queryClient.invalidateQueries({ queryKey: ['leases'] })
    queryClient.invalidateQueries({ queryKey: ['installments'] })
  }

  return {
    validateSignature: useMutation({
      mutationFn: () => validateSignature(leaseId),
      onSuccess: invalidate,
    }),
    rejectSignature: useMutation({
      mutationFn: (reason: string) => rejectSignature(leaseId, reason),
      onSuccess: invalidate,
    }),
    recordCash: useMutation({
      mutationFn: ({ ids, amount }: { ids: number[]; amount: number }) =>
        recordCashPayment(leaseId, ids, amount),
      onSuccess: invalidate,
    }),
    recordCashInitial: useMutation({
      mutationFn: () => recordCashInitialPayment(leaseId),
      onSuccess: invalidate,
    }),
  }
}

/**
 * Opens a private document. It cannot be a plain link: the file sits behind the
 * bearer token, so it is fetched as a blob and handed to the browser.
 */
export function useDocumentOpener() {
  const open = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return {
    openContract: async (leaseId: number, reference: string, signed = false) => {
      const blob = await downloadLeaseDocument(leaseId, signed ? 'signed-contract' : 'contract')
      open(blob, `${signed ? 'contrat-signe' : 'contrat'}-${reference}.pdf`)
    },
    openReceipt: async (installmentId: number, reference: string) => {
      open(await downloadReceipt(installmentId), `quittance-${reference}.pdf`)
    },
  }
}
