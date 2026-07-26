import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/auth.store'

/**
 * Guests can browse the feed and properties freely (public endpoints), but
 * actions like liking, commenting, or messaging an agency require an
 * account. Call requireAuth() before those mutations; it redirects to
 * login and returns false when the visitor isn't signed in.
 */
export function useRequireAuth() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return function requireAuth() {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return false
    }
    return true
  }
}
