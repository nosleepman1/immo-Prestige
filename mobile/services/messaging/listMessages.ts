import API from '@/api/api'
import type { Message } from '@/types/messaging'

export interface PaginatedMessages {
  data: Message[]
  meta?: { current_page: number; last_page: number }
}

/** Reverse-chronological: the API paginates newest-first. */
export async function listMessages(conversationId: number, page = 1): Promise<PaginatedMessages> {
  const { data } = await API.get<PaginatedMessages>(`/conversations/${conversationId}/messages`, {
    params: { page },
  })
  return data
}
