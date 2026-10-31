import type { User } from '@/api/auth/types';
import { authClient } from '@/api/auth/authClient';

export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous';

export interface AuthSnapshot {
  status: AuthStatus;
  user: User | null;
}

/**
 * Snapshot used while rendering on the server. It always reports `unknown`, so
 * the server render and the first client render agree and React does not warn
 * about a hydration mismatch.
 */
const SERVER_SNAPSHOT: AuthSnapshot = { status: 'unknown', user: null };

let snapshot: AuthSnapshot = SERVER_SNAPSHOT;
let restorePromise: Promise<boolean> | null = null;

const listeners = new Set<() => void>();

function publish(next: AuthSnapshot): void {
  snapshot = next;

  for (const listener of listeners) {
    listener();
  }
}

export function getSnapshot(): AuthSnapshot {
  return snapshot;
}

export function getServerSnapshot(): AuthSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function setAuthenticated(user: User): void {
  publish({ status: 'authenticated', user });
}

export function setAnonymous(): void {
  publish({ status: 'anonymous', user: null });
}

async function restore(): Promise<boolean> {
  try {
    const response = await authClient.refresh();

    if (response) {
      setAuthenticated(response.user);
      return true;
    }

    setAnonymous();
    return false;
  } catch {
    // A network failure must not destroy the refresh cookie. The user can
    // reload or sign in again without losing the underlying session.
    setAnonymous();
    return false;
  }
}

/**
 * Resolves the session once and remembers the outcome. Callers can await this
 * from route guards as well as from React; refresh tokens are single use, so
 * every caller has to share a single in-flight restore.
 */
export function ensureSession(): Promise<boolean> {
  if (snapshot.status !== 'unknown') {
    return Promise.resolve(snapshot.status === 'authenticated');
  }

  restorePromise ??= restore().finally(() => {
    restorePromise = null;
  });

  return restorePromise;
}

/**
 * Forces the next `ensureSession` call to restore the session again. Used when
 * the refresh cookie may have been replaced by another tab or a new sign in.
 */
export function resetSession(): void {
  restorePromise = null;
  setAnonymous();
}
