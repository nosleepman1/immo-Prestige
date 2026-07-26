import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelApplication,
  checkoutInitialPayment,
  checkoutInstallments,
  getMyApplication,
  getMyLease,
  listLeaseInstallments,
  listMyApplications,
  listMyLeases,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  submitRentalApplication,
  uploadSignedContract,
  validateLeaseTerms,
} from '@/services/rental/rental'
import { queryKeys } from '@/lib/queryKeys'

export function useMyApplications() {
  return useQuery({ queryKey: queryKeys.rentalApplications.mine, queryFn: listMyApplications })
}

export function useMyApplication(id: number) {
  return useQuery({
    queryKey: queryKeys.rentalApplications.detail(id),
    queryFn: () => getMyApplication(id),
    enabled: Number.isFinite(id),
  })
}

export function useSubmitApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitRentalApplication,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.rentalApplications.mine }),
  })
}

export function useCancelApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelApplication,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rental-applications'] }),
  })
}

export function useMyLeases() {
  return useQuery({ queryKey: queryKeys.leases.mine, queryFn: listMyLeases })
}

export function useMyLease(id: number) {
  return useQuery({
    queryKey: queryKeys.leases.detail(id),
    queryFn: () => getMyLease(id),
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

export function useLeaseActions(leaseId: number) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leases.detail(leaseId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.leases.installments(leaseId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.leases.mine })
  }

  return {
    validateTerms: useMutation({ mutationFn: () => validateLeaseTerms(leaseId), onSuccess: invalidate }),
    uploadSignature: useMutation({
      mutationFn: (file: { uri: string; name: string; type: string }) =>
        uploadSignedContract(leaseId, file),
      onSuccess: invalidate,
    }),
    // Checkout only returns a URL — nothing advances until the provider
    // confirms, so there is nothing to invalidate here.
    checkoutInitial: useMutation({ mutationFn: () => checkoutInitialPayment(leaseId) }),
    checkoutMonths: useMutation({
      mutationFn: (ids: number[]) => checkoutInstallments(leaseId, ids),
    }),
  }
}

export function useNotifications() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: listNotifications })
}

export function useNotificationActions() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications })

  return {
    markRead: useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate }),
    markAllRead: useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate }),
  }
}
