import API from '@/api/api'
import type { User } from '@/types/auth'

export async function getCurrentUser(): Promise<User> {
  const { data } = await API.get<{ data: { user: User } }>('/user')
  return data.data.user
}
