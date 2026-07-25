import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markConversationRead } from '@/services/messaging/markConversationRead'
import { queryKeys } from '@/lib/queryKeys'

export function useMarkConversationRead(conversationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markConversationRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list })
    },
  })
}
