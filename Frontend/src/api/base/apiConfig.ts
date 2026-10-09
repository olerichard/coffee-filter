/**
 * Base URL for the backend API.
 *
 * In production the API is served on the same origin through Caddy at /api.
 * During local development, derive the API hostname from the page hostname so
 * localhost, 127.0.0.1, and LAN devices all reach the same backend machine.
 * Set VITE_API_URL to override either behaviour.
 */
const API_PORT = 5186

const getDevelopmentApiBaseUrl = () => {
  // `window` is absent during SSR, so fall back to loopback there.
  const hostname =
    typeof window === 'undefined' ? '127.0.0.1' : window.location.hostname

  return `http://${hostname}:${API_PORT}/api`
}

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? getDevelopmentApiBaseUrl() : '/api')
