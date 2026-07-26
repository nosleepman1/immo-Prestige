import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import axios from 'axios'
import { register } from '@/services/auth/register'
import type { RegisterRequest } from '@/types/auth'

export function useRegister() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload),
    onSuccess: () => {
      router.replace('/auth/login')
    },
  })

  const errorMessage = axios.isAxiosError(mutation.error)
    ? ((mutation.error.response?.data as { message?: string })?.message ?? 'Inscription impossible.')
    : mutation.error
      ? 'Connexion impossible. Vérifiez votre réseau.'
      : null

  return { ...mutation, errorMessage }
}
