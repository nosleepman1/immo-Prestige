import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendMessage } from '@/services/messaging/sendMessage'
import { queryKeys } from '@/lib/queryKeys'

export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.messages(conversationId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list })
    },
  })
}
