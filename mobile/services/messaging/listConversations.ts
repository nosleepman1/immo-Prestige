import API from '@/api/api'
import type { Conversation } from '@/types/messaging'

export async function listConversations(): Promise<Conversation[]> {
  const { data } = await API.get<{ data: Conversation[] }>('/conversations')
  return data.data
}
