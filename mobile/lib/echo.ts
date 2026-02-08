import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import API, { API_URL } from '@/api/api'

const ROOT_URL = API_URL.replace(/\/api\/v1\/?$/, '')

// In React Native / Metro, `pusher-js` or `laravel-echo` may be imported as an ES module object `{ default: Constructor }`.
// Extract the actual callable constructor before assigning it to `global.Pusher`.
const PusherClient =
  typeof Pusher === 'function'
    ? Pusher
    : (Pusher as unknown as { default: typeof Pusher })?.default || Pusher

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Pusher = PusherClient

let echoInstance: Echo<'reverb'> | null = null

/**
 * Channel authorisation, routed through the app's own axios client.
 *
 * Two things this fixes over passing static `auth.headers`:
 *
 * 1. The token is read on every request instead of once at construction. Echo
 *    is memoised, so an instance built before sign-in kept `Bearer ` forever
 *    and every private channel was silently refused.
 *
 * 2. The client carries `ngrok-skip-browser-warning`. Without it the free
 *    tunnel answers the auth POST with its HTML interstitial, which Echo tries
 *    to parse as JSON — a failure that reads like a broken socket rather than a
 *    blocked request.
 */
function authorizer(channel: { name: string }) {
  return {
    // Signature imposed by pusher-js's ChannelAuthorizationCallback.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authorize: (socketId: string, callback: (error: any, data: any) => void) => {
      API.post(
        `${ROOT_URL}/broadcasting/auth`,
        { socket_id: socketId, channel_name: channel.name },
        // Absolute URL: broadcasting/auth sits outside /api/v1.
        { baseURL: '' }
      )
        .then((response) => callback(false, response.data))
        .catch((error) => callback(true, error))
    },
  }
}

const connectionConfig = {
  Pusher: PusherClient,
  key: process.env.EXPO_PUBLIC_REVERB_APP_KEY,
  wsHost: process.env.EXPO_PUBLIC_REVERB_HOST || 'localhost',
  wsPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT) || 8080,
  wssPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT) || 8080,
  forceTLS: (process.env.EXPO_PUBLIC_REVERB_SCHEME || 'http') === 'https',
  enabledTransports: ['ws', 'wss'] as ('ws' | 'wss')[],
  authorizer,
}

export function getEcho(): Echo<'reverb'> {
  if (echoInstance) return echoInstance

  const EchoConstructor =
    typeof Echo === 'function'
      ? Echo
      : (Echo as unknown as { default: typeof Echo })?.default || Echo

  try {
    echoInstance = new EchoConstructor({ broadcaster: 'reverb', ...connectionConfig })
  } catch {
    // The reverb connector's constructor checks fail on the React Native
    // bundled runtime; pusher-js speaks the same protocol.
    echoInstance = new EchoConstructor({
      broadcaster: 'pusher',
      cluster: '',
      ...connectionConfig,
    }) as unknown as Echo<'reverb'>
  }

  return echoInstance
}

/**
 * Drops the socket and forgets the instance.
 *
 * Called on sign-out: the next sign-in must authorise with the new token
 * rather than resume a connection bound to the previous session.
 */
export function disconnectEcho(): void {
  echoInstance?.disconnect()
  echoInstance = null
}