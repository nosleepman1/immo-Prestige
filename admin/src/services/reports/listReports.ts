import API from '@/api/api'
import type { Report, ReportStatus } from '@/types/report'

export async function listReports(status?: ReportStatus): Promise<Report[]> {
  const { data } = await API.get<{ data: Report[] }>('/admin/reports', {
    params: status ? { status } : undefined,
  })
  return data.data
}
