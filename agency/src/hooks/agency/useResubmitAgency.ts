import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { resubmitAgency, type ResubmitAgencyPayload } from '@/services/agency/resubmitAgency'
import { useAuthStore } from '@/store/auth.store'

export function useResubmitAgency() {
  const queryClient = useQueryClient()
  const setAgency = useAuthStore((s) => s.setAgency)

  return useMutation({
    mutationFn: (payload: ResubmitAgencyPayload) => resubmitAgency(payload),
    onSuccess: (agency) => {
      setAgency(agency)
      toast.success('Dossier redéposé — en attente d\'examen.')
      queryClient.invalidateQueries({ queryKey: ['agency', 'me'] })
    },
    onError: () => toast.error('Impossible de redéposer le dossier.'),
  })
}
