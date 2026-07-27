import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const API = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // ngrok's free tier answers an HTML interstitial to anything that looks
    // like a browser; without this the app parses a warning page as JSON.
    // Ignored by every other host, so it costs nothing in production.
    'ngrok-skip-browser-warning': '1',
  },
})

API.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default API
export { API_URL }
