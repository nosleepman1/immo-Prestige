import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '@/services/auth/currentUser'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/store/auth.store'

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getCurrentUser,
    enabled: !!token,
    staleTime: 1000 * 60,
    retry: false,
  })
}
