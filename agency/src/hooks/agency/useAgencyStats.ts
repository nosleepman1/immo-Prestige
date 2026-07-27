import { useQuery } from '@tanstack/react-query'
import { getAgencyStats } from '@/services/agency/getAgencyStats'

export function useAgencyStats() {
  return useQuery({
    queryKey: ['agency', 'stats'],
    queryFn: getAgencyStats,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
