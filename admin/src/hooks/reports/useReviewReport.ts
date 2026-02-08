import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reviewReport } from '@/services/reports/reviewReport'
import type { ReportStatus } from '@/types/report'

export function useReviewReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Extract<ReportStatus, 'reviewed' | 'dismissed'> }) =>
      reviewReport(id, status),
    onSuccess: () => {
      toast.success('Signalement traité.')
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
    onError: () => toast.error('Impossible de traiter ce signalement.'),
  })
}
