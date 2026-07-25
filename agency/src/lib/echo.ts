import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { useAuthStore } from '@/store/auth.store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const ROOT_URL = API_URL.replace(/\/api\/v1\/?$/, '')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).Pusher = Pusher

let echoInstance: Echo<'reverb'> | null = null

/**
 * Bearer-token auth for private channels: Echo's default authorizer posts to
 * /broadcasting/auth via fetch/XHR without our axios interceptor, so the
 * Authorization header has to be attached explicitly here.
 */
export function getEcho(): Echo<'reverb'> {
  if (echoInstance) return echoInstance

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${ROOT_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${useAuthStore.getState().token ?? ''}`,
      },
    },
  })

  return echoInstance
}

export function disconnectEcho(): void {
  echoInstance?.disconnect()
  echoInstance = null
}
