import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import { login } from '@/services/auth/login'
import { useAuthStore } from '@/store/auth.store'
import type { LoginRequest } from '@/types/auth'

const useLogin = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const mutation = useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    onSuccess: (result) => {
      if (result.user.role !== 'agency') {
        toast.error('Ce compte n\'est pas un compte agence.')
        return
      }
      setSession(result)
      toast.success('Connexion réussie')
      navigate('/')
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        toast.error((error.response.data as { message?: string })?.message ?? 'Identifiants invalides')
      } else {
        toast.error('Connexion impossible. Vérifiez votre réseau.')
      }
    },
  })

  return {
    handleLogin: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}

export default useLogin
