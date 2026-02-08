import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import { registerAgency, type RegisterAgencyPayload } from '@/services/agency/registerAgency'

export function useRegisterAgency() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterAgencyPayload) => registerAgency(payload),
    onSuccess: () => {
      toast.success('Dossier envoyé. Vous recevrez un email dès son examen par un administrateur.')
      navigate('/login')
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        toast.error((error.response.data as { message?: string })?.message ?? 'Impossible d\'envoyer le dossier.')
      } else {
        toast.error('Connexion impossible. Vérifiez votre réseau.')
      }
    },
  })
}
