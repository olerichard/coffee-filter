import { tokenStore } from './tokenStore';
import { AuthResponseSchema } from './schemas';
import type { AuthResponse } from './types';
import { API_BASE_URL } from '@/api/base/apiConfig';

let refreshPromise: Promise<AuthResponse | null> | null = null;

async function performRefresh(): Promise<AuthResponse | null> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
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

export function refreshSession(): Promise<AuthResponse | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
