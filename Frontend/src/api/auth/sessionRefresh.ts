import { tokenStore } from './tokenStore';
import { AuthResponseSchema } from './schemas';
import type { AuthResponse } from './types';
import { API_BASE_URL } from '@/api/base/apiConfig';

let refreshPromise: Promise<AuthResponse | null> | null = null;

interface LockManagerLike {
  request: <T>(name: string, callback: () => Promise<T>) => Promise<T>;
}

async function performRefresh(): Promise<AuthResponse | null> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      if (attempt === 0 && response.headers.get('X-Refresh-Retry') === '1') {
        // Another tab or request won the rotation race. The winning response
        // has already set a new cookie; retry once with that cookie.
        await new Promise((resolve) => {
          setTimeout(resolve, 150);
        });
        continue;
      }

      tokenStore.clear();
      return null;
    }

    if (!response.ok) {
      throw new Error(`Session refresh failed with status ${response.status}`);
    }

    const data = AuthResponseSchema.parse(await response.json());
    tokenStore.setSession(data.accessToken, data.expiresAt);
    return data;
  }

  tokenStore.clear();
  return null;
}

async function withRefreshLock<T>(callback: () => Promise<T>): Promise<T> {
  const lockManager =
    typeof navigator === 'undefined'
      ? undefined
      : (navigator as unknown as { locks?: LockManagerLike }).locks;

  if (lockManager) {
    return lockManager.request('coffee-filter-auth-refresh', callback);
  }

  return callback();
}

export function refreshSession(): Promise<AuthResponse | null> {
  if (!refreshPromise) {
    refreshPromise = withRefreshLock(performRefresh).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
