import API from '@/api/api'
import type { MeResult } from '@/types/auth'

export async function getCurrentUser(): Promise<MeResult> {
  const { data } = await API.get<{ data: MeResult }>('/user')
  return data.data
}
