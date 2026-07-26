import API from '@/api/api'
import type { Plan } from '@/types/subscription'

export async function listPlans(): Promise<Plan[]> {
  const { data } = await API.get<{ data: Plan[] }>('/subscriptions/plans')
  return data.data
}
