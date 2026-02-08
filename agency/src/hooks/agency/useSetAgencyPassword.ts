import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import { setAgencyPassword, type SetAgencyPasswordPayload } from '@/services/agency/setAgencyPassword'
import { useAuthStore } from '@/store/auth.store'

export function useSetAgencyPassword() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: (payload: SetAgencyPasswordPayload) => setAgencyPassword(payload),
    onSuccess: (result) => {
      setSession({ token: result.access_token, user: result.user, agency: result.agency })
      toast.success('Mot de passe défini — bienvenue sur ImmoPrestige !')
      navigate('/')
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        toast.error((error.response.data as { message?: string })?.message ?? 'Lien invalide ou expiré.')
      } else {
        toast.error('Connexion impossible. Vérifiez votre réseau.')
      }
    },
  })
}
