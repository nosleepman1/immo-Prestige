import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { User, Agency } from '@/types/auth'

interface AuthState {
  token: string | null
  user: User | null
  agency: Agency | null
  isAuthenticated: boolean
  setSession: (session: { token: string; user: User; agency?: Agency | null }) => void
  setProfile: (profile: { user: User; agency?: Agency | null }) => void
  logout: () => void
}

/**
 * Single source of truth for the admin session, replacing AuthContext +
 * tokenStore. Persisted to localStorage so a refresh doesn't drop the
 * session; the axios interceptor reads the token via getState() (works
 * outside React components/hooks).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      agency: null,
      isAuthenticated: false,
      setSession: ({ token, user, agency }) =>
        set({ token, user, agency: agency ?? null, isAuthenticated: true }),
      setProfile: ({ user, agency }) =>
        set((state) => ({ ...state, user, agency: agency ?? null, isAuthenticated: true })),
      logout: () => set({ token: null, user: null, agency: null, isAuthenticated: false }),
    }),
    {
      name: 'immoprestige-admin-auth',
      storage: createJSONStorage(() => localStorage),
      // No partialize: JSON.stringify drops the function-valued keys on its
      // own, and isAuthenticated must survive rehydration alongside the token.
    }
  )
)
