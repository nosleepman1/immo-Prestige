import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import axios from 'axios'
import { login } from '@/services/auth/login'
import { useAuthStore } from '@/store/auth.store'
import type { LoginRequest } from '@/types/auth'

export function useLogin() {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)

  const mutation = useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (result) => {
      setSession(result)
      router.replace('/(tabs)')
    },
  })

  const errorMessage = axios.isAxiosError(mutation.error)
    ? ((mutation.error.response?.data as { message?: string })?.message ?? 'Identifiants invalides')
    : mutation.error
      ? 'Connexion impossible. Vérifiez votre réseau.'
      : null

  return { ...mutation, errorMessage }
}
