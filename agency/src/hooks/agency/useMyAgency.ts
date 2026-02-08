import { useQuery } from '@tanstack/react-query'
import { getMyAgency } from '@/services/agency/getMyAgency'
import { useAuthStore } from '@/store/auth.store'

export function useMyAgency() {
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: ['agency', 'me'],
    queryFn: getMyAgency,
    enabled: !!token,
  })
}
