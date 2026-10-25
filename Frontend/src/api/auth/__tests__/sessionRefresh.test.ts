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
  vi.useRealTimers();
  vi.unstubAllGlobals();
  tokenStore.clear();
});

describe('refreshSession', () => {
  it('retries once when another tab won the rotation race', async () => {
    vi.useFakeTimers();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 401,
          headers: { 'X-Refresh-Retry': '1' },
        }),
      )
      .mockResolvedValueOnce(jsonResponse(authResponse));

    vi.stubGlobal('fetch', fetchMock);

    const refreshing = refreshSession();
    await vi.advanceTimersByTimeAsync(150);
    const result = await refreshing;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result?.user.username).toBe('testadmin');
    expect(tokenStore.getAccessToken()).toBe(authResponse.accessToken);
  });

  it('shares one refresh across concurrent callers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(authResponse));
    vi.stubGlobal('fetch', fetchMock);

    const [first, second] = await Promise.all([
      refreshSession(),
      refreshSession(),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });
});
