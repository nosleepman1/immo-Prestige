import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  acceptRentalApplication,
  getRentalApplication,
  listRentalApplications,
  rejectRentalApplication,
  requestApplicationDocuments,
} from '@/services/rental/rentalApplications'
import { queryKeys } from '@/lib/queryKeys'
import type { RentalApplicationStatus } from '@/types/rental'

export function useRentalApplications(status?: RentalApplicationStatus) {
  return useQuery({
    queryKey: queryKeys.rentalApplications.list(status),
    queryFn: () => listRentalApplications(status),
  })
}

export function useRentalApplication(id: number) {
  return useQuery({
    queryKey: queryKeys.rentalApplications.detail(id),
    queryFn: () => getRentalApplication(id),
    enabled: Number.isFinite(id),
  })
}

export function useReviewApplication(id: number) {
  const queryClient = useQueryClient()

  // A decision changes both the detail and every list it appears in, so both
  // are invalidated rather than the one the user happens to be looking at.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.rentalApplications.detail(id) })
    queryClient.invalidateQueries({ queryKey: ['rental-applications'] })
  }

  return {
    accept: useMutation({ mutationFn: () => acceptRentalApplication(id), onSuccess: invalidate }),
    reject: useMutation({
      mutationFn: (reason: string) => rejectRentalApplication(id, reason),
      onSuccess: invalidate,
    }),
    requestDocuments: useMutation({
      mutationFn: (documents: string) => requestApplicationDocuments(id, documents),
      onSuccess: invalidate,
    }),
  }
}
