import API from '@/api/api'
import type { CheckoutResult } from '@/types/subscription'

export async function checkoutSubscription(planId: number): Promise<CheckoutResult> {
  const { data } = await API.post<{ data: CheckoutResult }>('/subscriptions/checkout', { plan_id: planId })
  return data.data
}
