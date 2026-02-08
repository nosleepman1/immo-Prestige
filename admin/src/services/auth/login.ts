import API from '@/api/api'
import type { LoginRequest, LoginResult } from '@/types/auth'

export async function login(payload: LoginRequest): Promise<LoginResult> {
  const { data } = await API.post<{ data: LoginResult }>('/auth/login', payload)
  return data.data
}
