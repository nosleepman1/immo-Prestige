import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { logout as logoutRequest } from '@/services/auth/logout'
import { useAuthStore } from '@/store/auth.store'
import { disconnectEcho } from '@/lib/echo'

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearSession()
      disconnectEcho()
      queryClient.clear()
      router.replace('/auth/login')
    },
  })
}
