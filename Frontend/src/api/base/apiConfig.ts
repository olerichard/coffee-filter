/**
 * Base URL for the backend API.
 *
 * Derived from the hostname the page was loaded from, so the same build works
 * on localhost, on 127.0.0.1, and on this machine's LAN address (including
 * from other devices, where a hardcoded 127.0.0.1 would point at the wrong
 * machine). Set VITE_API_URL to override.
 */
const API_PORT = 5186

// `window` is absent during SSR, so fall back to loopback there.
const hostname =
  typeof window === 'undefined' ? '127.0.0.1' : window.location.hostname

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? `http://${hostname}:${API_PORT}/api`
