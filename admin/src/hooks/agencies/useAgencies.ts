import { useQuery } from '@tanstack/react-query'
import { listAgencies } from '@/services/agencies/listAgencies'
import { queryKeys } from '@/lib/queryKeys'
import type { AgencyStatus } from '@/types/auth'

export function useAgencies(status?: AgencyStatus) {
  return useQuery({
    queryKey: queryKeys.agencies.list(status),
    queryFn: () => listAgencies(status),
  })
}
