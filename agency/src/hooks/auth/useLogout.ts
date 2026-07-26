import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { logout as logoutRequest } from '@/services/auth/logout'
import { useAuthStore } from '@/store/auth.store'
import { disconnectEcho } from '@/lib/echo'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearSession()
      disconnectEcho()
      queryClient.clear()
      navigate('/login')
    },
  })
}
