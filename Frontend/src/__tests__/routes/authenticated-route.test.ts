import { describe, expect, it, vi } from 'vitest';
import { isRedirect } from '@tanstack/react-router';
import { Route } from '@/routes/_authenticated/route';

const { ensureSessionMock } = vi.hoisted(() => ({
  ensureSessionMock: vi.fn(),
}));

vi.mock('@/components/context/authentication/authSession', () => ({
  ensureSession: ensureSessionMock,
}));

const runGuard = (pathname: string) =>
  (
    Route.options.beforeLoad as (context: {
      location: { pathname: string };
    }) => Promise<unknown>
  )({ location: { pathname } });

async function catchRedirect(result: Promise<unknown>) {
  try {
    await result;
  } catch (error) {
    if (isRedirect(error)) {
      return error;
    }

    throw error;
  }

  throw new Error('Expected the guard to redirect.');
}

describe('_authenticated beforeLoad', () => {
  it('sends a signed out visitor to login and remembers the path', async () => {
    ensureSessionMock.mockResolvedValue(false);

    const redirect = await catchRedirect(runGuard('/settings'));

    expect(redirect.options.to).toBe('/login');
    expect(redirect.options.search).toEqual({ redirect: '/settings' });
    expect(redirect.options.replace).toBe(true);
  });

  it('does not add a redirect target for the dashboard', async () => {
    ensureSessionMock.mockResolvedValue(false);

    const redirect = await catchRedirect(runGuard('/'));

    expect(redirect.options.to).toBe('/login');
    expect(redirect.options.search).toEqual({});
  });

  it('lets a signed in visitor through', async () => {
    ensureSessionMock.mockResolvedValue(true);

    await expect(runGuard('/settings')).resolves.toBeUndefined();
  });

  it('renders the guarded subtree on the client only', () => {
    expect(Route.options.ssr).toBe(false);
  });
});
