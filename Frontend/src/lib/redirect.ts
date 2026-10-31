/**
 * Paths that require an authenticated session. Keep in sync with the routes
 * inside `src/routes/_authenticated`.
 */
export const PROTECTED_PATHS = ['/', '/settings'] as const;

export type ProtectedPath = (typeof PROTECTED_PATHS)[number];

const DEFAULT_TARGET: ProtectedPath = '/';

export function isProtectedPath(pathname: string): pathname is ProtectedPath {
  return PROTECTED_PATHS.some((path) => path === pathname);
}

/**
 * Resolves a `?redirect=` value to a known protected path. Anything unknown or
 * external falls back to the dashboard, so the parameter cannot be used as an
 * open redirect.
 */
export function resolveRedirectTarget(
  value: string | undefined,
): ProtectedPath {
  if (value && isProtectedPath(value)) {
    return value;
  }

  return DEFAULT_TARGET;
}
