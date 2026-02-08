import API from '@/api/api'
import type { ReportableType, ReportReason } from '@/types/social'

export interface CreateReportPayload {
  reportable_type: ReportableType
  reportable_id: number
  reason: ReportReason
  details?: string
}

export async function createReport(payload: CreateReportPayload): Promise<void> {
  await API.post('/reports', payload)
}
