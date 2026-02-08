import API from '@/api/api'
import type { Subscription } from '@/types/subscription'

export async function getCurrentSubscription(): Promise<Subscription> {
  const { data } = await API.get<{ data: Subscription }>('/subscriptions/me')
  return data.data
}
