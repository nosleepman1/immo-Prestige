import type { Property, PublicAgency } from './property'

export interface Conversation {
  id: number
  property: Property | null
  client: { id: number; name: string } | null
  agency: PublicAgency | null
  last_message_at: string | null
  unread_count?: number
  created_at: string
}

export interface Message {
  id: number
  conversation_id: number
  sender: { id: number; name: string } | null
  content: string
  read_at: string | null
  created_at: string
}
