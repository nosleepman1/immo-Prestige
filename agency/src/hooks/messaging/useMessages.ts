import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listMessages } from '@/services/messaging/listMessages'
import { queryKeys } from '@/lib/queryKeys'
import { getEcho } from '@/lib/echo'

/**
 * The broadcast payload only carries flat fields (id, sender_id, content...),
 * not the sender's name — simplest correct approach is to invalidate and
 * refetch the REST page, which always has the full shape.
 */
export function useMessages(conversationId: number) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.conversations.messages(conversationId),
    queryFn: () => listMessages(conversationId),
    enabled: Number.isFinite(conversationId),
  })

  useEffect(() => {
    if (!Number.isFinite(conversationId)) return

    const channelName = `conversation.${conversationId}`
    const channel = getEcho().private(channelName)

    const onMessage = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.messages(conversationId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list })
    }

    channel.listen('.message.sent', onMessage)
    channel.listen('.messages.read', onMessage)

    return () => {
      getEcho().leave(channelName)
    }
  }, [conversationId, queryClient])

  return query
}
