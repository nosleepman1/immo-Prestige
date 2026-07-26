import { useMutation } from '@tanstack/react-query'
import { createReport, type CreateReportPayload } from '@/services/social/createReport'

export function useCreateReport() {
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => createReport(payload),
  })
}
