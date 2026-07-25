import API from '@/api/api'
import type { Conversation } from '@/types/messaging'

export async function startConversation(agencyId: number, propertyId?: number): Promise<Conversation> {
  const { data } = await API.post<{ data: Conversation }>('/conversations', {
    agency_id: agencyId,
    property_id: propertyId,
  })
  return data.data
}
