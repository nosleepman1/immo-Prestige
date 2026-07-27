import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { useAuthStore } from '@/store/auth.store'
import { API_URL } from '@/api/api'

const ROOT_URL = API_URL.replace(/\/api\/v1\/?$/, '')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Pusher = Pusher

let echoInstance: Echo<'reverb'> | null = null

/** Bearer-token auth for private channels (same approach as the web apps). */
export function getEcho(): Echo<'reverb'> {
  if (echoInstance) return echoInstance

  try {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: process.env.EXPO_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.EXPO_PUBLIC_REVERB_HOST || 'localhost',
      wsPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT) || 8080,
      wssPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT) || 8080,
      forceTLS: (process.env.EXPO_PUBLIC_REVERB_SCHEME || 'http') === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${ROOT_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token ?? ''}`,
        },
      },
    })
  } catch {
    // Fallback for React Native bundled environment if reverb connector constructor checks fail
    echoInstance = new Echo({
      broadcaster: 'pusher',
      key: process.env.EXPO_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.EXPO_PUBLIC_REVERB_HOST || 'localhost',
      wsPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT) || 8080,
      wssPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT) || 8080,
      forceTLS: (process.env.EXPO_PUBLIC_REVERB_SCHEME || 'http') === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${ROOT_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token ?? ''}`,
        },
      },
    }) as unknown as Echo<'reverb'>
  }

  return echoInstance
}

export function disconnectEcho(): void {
  echoInstance?.disconnect()
  echoInstance = null
}
