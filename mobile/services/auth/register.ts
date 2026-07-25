import API from '@/api/api'
import type { RegisterRequest, User } from '@/types/auth'

export async function register(payload: RegisterRequest): Promise<User> {
  const { data } = await API.post<{ data: User }>('/auth/register', payload)
  return data.data
}
