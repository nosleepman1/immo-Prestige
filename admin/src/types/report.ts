export type ReportableType = 'post' | 'comment' | 'comment_reply'
export type ReportReason = 'spam' | 'abusive' | 'inappropriate' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'

export interface Report {
  id: number
  reportable_type: ReportableType
  reportable_id: number
  reason: ReportReason
  details: string | null
  status: ReportStatus
  reporter?: { id: number; name: string }
  created_at: string
}
