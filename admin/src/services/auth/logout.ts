import API from '@/api/api'

export async function logout(): Promise<void> {
  await API.post('/auth/logout')
}
