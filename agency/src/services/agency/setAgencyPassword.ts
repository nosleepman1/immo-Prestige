import API from '@/api/api'
import type { Agency, User } from '@/types/auth'

export interface SetAgencyPasswordPayload {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export interface SetAgencyPasswordResult {
  user: User
  agency: Agency
  access_token: string
}

export async function setAgencyPassword(payload: SetAgencyPasswordPayload): Promise<SetAgencyPasswordResult> {
  const { data } = await API.post<{ data: SetAgencyPasswordResult }>('/agency/password', payload)
  return data.data
}
