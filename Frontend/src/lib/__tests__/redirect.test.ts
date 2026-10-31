import { describe, expect, it } from 'vitest';
import { isProtectedPath, resolveRedirectTarget } from '../redirect';

describe('isProtectedPath', () => {
  it('accepts known protected paths', () => {
    expect(isProtectedPath('/')).toBe(true);
    expect(isProtectedPath('/settings')).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isProtectedPath('/login')).toBe(false);
    expect(isProtectedPath('/settings/advanced')).toBe(false);
    expect(isProtectedPath('/unknown')).toBe(false);
  });
});

describe('resolveRedirectTarget', () => {
  it('falls back to the dashboard when there is no redirect', () => {
    expect(resolveRedirectTarget(undefined)).toBe('/');
    expect(resolveRedirectTarget('')).toBe('/');
  });

  it('keeps a known protected path', () => {
    expect(resolveRedirectTarget('/settings')).toBe('/settings');
    expect(resolveRedirectTarget('/')).toBe('/');
  });

  it('refuses external and unknown targets', () => {
    expect(resolveRedirectTarget('//evil.example')).toBe('/');
    expect(resolveRedirectTarget('https://evil.example')).toBe('/');
    expect(resolveRedirectTarget('/login')).toBe('/');
    expect(resolveRedirectTarget('/settings?tab=account')).toBe('/');
    expect(resolveRedirectTarget('/unknown')).toBe('/');
  });
});
