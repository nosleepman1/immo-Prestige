import { useQuery } from '@tanstack/react-query'
import { listReports } from '@/services/reports/listReports'
import { queryKeys } from '@/lib/queryKeys'
import type { ReportStatus } from '@/types/report'

export function useReports(status?: ReportStatus) {
  return useQuery({
    queryKey: queryKeys.reports.list(status),
    queryFn: () => listReports(status),
  })
}
