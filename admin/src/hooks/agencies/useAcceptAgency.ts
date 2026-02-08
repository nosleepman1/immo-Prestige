import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { acceptAgency } from '@/services/agencies/acceptAgency'

export function useAcceptAgency() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => acceptAgency(id),
    onSuccess: (agency) => {
      toast.success(`${agency.company_name} acceptée — lien de mot de passe envoyé.`)
      queryClient.invalidateQueries({ queryKey: ['agencies'] })
    },
    onError: () => toast.error('Impossible d\'accepter cette agence.'),
  })
}
