import API from '@/api/api'
import type { Report, ReportStatus } from '@/types/report'

export async function reviewReport(id: number, status: Extract<ReportStatus, 'reviewed' | 'dismissed'>): Promise<Report> {
  const { data } = await API.patch<{ data: Report }>(`/admin/reports/${id}/review`, { status })
  return data.data
}
