import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { refuseAgency } from '@/services/agencies/refuseAgency'

export function useRefuseAgency() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => refuseAgency(id, reason),
    onSuccess: (agency) => {
      toast.success(`${agency.company_name} refusée.`)
      queryClient.invalidateQueries({ queryKey: ['agencies'] })
    },
    onError: () => toast.error('Impossible de refuser cette agence.'),
  })
}
