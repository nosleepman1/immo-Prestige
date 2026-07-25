import { useQuery } from '@tanstack/react-query'
import { listConversations } from '@/services/messaging/listConversations'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/store/auth.store'

export function useConversations() {
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: queryKeys.conversations.list,
    queryFn: listConversations,
    enabled: !!token,
    refetchInterval: 15_000,
  })
}
