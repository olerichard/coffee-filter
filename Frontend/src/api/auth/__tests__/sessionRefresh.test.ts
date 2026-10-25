import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshSession } from '../sessionRefresh';
import { tokenStore } from '../tokenStore';

const authResponse = {
  accessToken: 'new-access-token',
  expiresAt: '2026-10-25T12:30:00Z',
  user: {
    id: 1,
    username: 'testadmin',
    email: 'test@example.com',
    displayName: 'Test Admin',
    isActive: true,
    lastLoginAt: null,
  },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  tokenStore.clear();
});

describe('refreshSession', () => {
  it('shares one refresh across concurrent callers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(authResponse));
    vi.stubGlobal('fetch', fetchMock);

    const [first, second] = await Promise.all([
      refreshSession(),
      refreshSession(),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
    expect(tokenStore.getAccessToken()).toBe(authResponse.accessToken);
  });

  it('clears the access token when refresh is unauthorized', async () => {
    tokenStore.setSession('old-access-token', '2026-10-25T12:30:00Z');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    );

    const result = await refreshSession();

    expect(result).toBeNull();
    expect(tokenStore.getAccessToken()).toBeNull();
  });
});
