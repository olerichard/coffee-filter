import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/api/auth/types';

const { refreshMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
}));

vi.mock('@/api/auth/authClient', () => ({
  authClient: { refresh: refreshMock },
}));

const testUser: User = {
  id: 1,
  username: 'testadmin',
  email: 'test@example.com',
  displayName: 'Test Admin',
  isActive: true,
  lastLoginAt: null,
};

/** The store keeps module level state, so every test needs a fresh module. */
async function loadStore() {
  vi.resetModules();
  return import('../authSession');
}

beforeEach(() => {
  refreshMock.mockReset();
});

describe('ensureSession', () => {
  it('marks the session as anonymous when there is no refresh cookie', async () => {
    refreshMock.mockResolvedValue(null);

    const store = await loadStore();

    await expect(store.ensureSession()).resolves.toBe(false);
    expect(store.getSnapshot()).toEqual({ status: 'anonymous', user: null });
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('stores the user when the refresh succeeds', async () => {
    refreshMock.mockResolvedValue({ user: testUser });

    const store = await loadStore();

    await expect(store.ensureSession()).resolves.toBe(true);
    expect(store.getSnapshot()).toEqual({
      status: 'authenticated',
      user: testUser,
    });
  });

  it('shares a single refresh between concurrent callers', async () => {
    let resolveRefresh: (value: { user: User }) => void = () => {};

    refreshMock.mockReturnValue(
      new Promise<{ user: User }>((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    const store = await loadStore();

    const first = store.ensureSession();
    const second = store.ensureSession();

    expect(refreshMock).toHaveBeenCalledTimes(1);

    resolveRefresh({ user: testUser });

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
  });

  it('only refreshes once and remembers the outcome', async () => {
    refreshMock.mockResolvedValue({ user: testUser });

    const store = await loadStore();

    await store.ensureSession();
    await store.ensureSession();

    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('treats a network failure as signed out without throwing', async () => {
    refreshMock.mockRejectedValue(new Error('offline'));

    const store = await loadStore();

    await expect(store.ensureSession()).resolves.toBe(false);
    expect(store.getSnapshot().status).toBe('anonymous');
  });
});

describe('authSession notifications', () => {
  it('notifies subscribers until they unsubscribe', async () => {
    const store = await loadStore();
    const listener = vi.fn();

    const unsubscribe = store.subscribe(listener);

    store.setAuthenticated(testUser);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toEqual({
      status: 'authenticated',
      user: testUser,
    });

    store.setAnonymous();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot()).toEqual({ status: 'anonymous', user: null });

    unsubscribe();

    store.setAuthenticated(testUser);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('reports unknown during server rendering', async () => {
    const store = await loadStore();

    expect(store.getServerSnapshot()).toEqual({
      status: 'unknown',
      user: null,
    });
  });
});
