import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { startConversation } from '@/services/messaging/startConversation'
import { queryKeys } from '@/lib/queryKeys'

export function useStartConversation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: ({ agencyId, propertyId }: { agencyId: number; propertyId?: number }) =>
      startConversation(agencyId, propertyId),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list })
      router.push(`/messages/${conversation.id}`)
    },
  })
}
