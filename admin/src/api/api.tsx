import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const API = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 secondes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ─── Request interceptor — injecte le token depuis le store Zustand ──────────

API.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor — gère les 401 globalement ─────────────────────────

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Token expiré ou invalide — purge la session
      useAuthStore.getState().logout()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default API