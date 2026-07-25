import { useQuery } from '@tanstack/react-query'
import { getAgency } from '@/services/agencies/getAgency'
import { queryKeys } from '@/lib/queryKeys'

export function useAgency(id: number) {
  return useQuery({
    queryKey: queryKeys.agencies.detail(id),
    queryFn: () => getAgency(id),
    enabled: Number.isFinite(id),
  })
}
