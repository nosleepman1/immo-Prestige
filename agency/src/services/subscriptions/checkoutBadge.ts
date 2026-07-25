import API from '@/api/api'
import type { CheckoutResult } from '@/types/subscription'

export async function checkoutBadge(): Promise<CheckoutResult> {
  const { data } = await API.post<{ data: CheckoutResult }>('/verification/checkout')
  return data.data
}
