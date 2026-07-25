import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from '@/types/auth'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  hasHydrated: boolean
  setSession: (session: { token: string; user: User }) => void
  setUser: (user: User) => void
  logout: () => void
  setHasHydrated: (value: boolean) => void
}

/**
 * Single source of truth for the client session, replacing any Context-based
 * auth. Persisted to AsyncStorage (React Native's equivalent of
 * localStorage); the axios interceptor reads the token via getState()
 * (works outside React components/hooks).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setSession: ({ token, user }) => set({ token, user, isAuthenticated: true }),
      setUser: (user) => set((state) => ({ ...state, user })),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'immoprestige-mobile-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
)
