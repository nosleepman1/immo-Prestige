import { useQuery } from '@tanstack/react-query'
import { getCurrentSubscription } from '@/services/subscriptions/getCurrentSubscription'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/store/auth.store'

export function useCurrentSubscription() {
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: getCurrentSubscription,
    enabled: !!token,
    retry: false,
  })
}
