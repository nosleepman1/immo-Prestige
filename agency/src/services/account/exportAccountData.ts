import API from '@/api/api'

export async function exportAccountData(): Promise<Record<string, unknown>> {
  const { data } = await API.get<{ data: Record<string, unknown> }>('/account/export')
  return data.data
}
