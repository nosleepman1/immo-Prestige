import API from '@/api/api'
import type { Message } from '@/types/messaging'

export async function sendMessage(conversationId: number, content: string): Promise<Message> {
  const { data } = await API.post<{ data: Message }>(`/conversations/${conversationId}/messages`, { content })
  return data.data
}
