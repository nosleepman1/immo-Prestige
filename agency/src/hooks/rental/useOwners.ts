import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createOwner, deleteOwner, listOwners, updateOwner } from '@/services/rental/owners'
import { queryKeys } from '@/lib/queryKeys'
import type { OwnerFormValues } from '@/types/rental'

export function useOwners() {
  return useQuery({ queryKey: queryKeys.owners.list, queryFn: listOwners })
}

export function useOwnerMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.owners.list })

  return {
    create: useMutation({ mutationFn: createOwner, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, values }: { id: number; values: Partial<OwnerFormValues> }) =>
        updateOwner(id, values),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: deleteOwner, onSuccess: invalidate }),
  }
}
