import API from '@/api/api'

export async function markConversationRead(conversationId: number): Promise<number> {
  const { data } = await API.post<{ data: { marked: number } }>(`/conversations/${conversationId}/read`)
  return data.data.marked
}
