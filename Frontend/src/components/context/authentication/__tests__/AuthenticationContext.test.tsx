import { describe, expect, it } from 'vitest';
import { authReducer } from '../AuthenticationContext';
import type { AuthState, User } from '../auth.types';

const testUser: User = {
  id: 1,
  username: 'testadmin',
  email: 'test@example.com',
  displayName: 'Test Admin',
  isActive: true,
  lastLoginAt: null,
};

const signedOutState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

const signedInState: AuthState = {
  user: testUser,
  isLoading: false,
  isAuthenticated: true,
};

describe('authReducer', () => {
  it('marks the session as loading on AUTH_START', () => {
    const state = authReducer(signedOutState, { type: 'AUTH_START' });

    expect(state.isLoading).toBe(true);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('stores the user on AUTH_SUCCESS', () => {
    const state = authReducer(
      { ...signedOutState, isLoading: true },
      { type: 'AUTH_SUCCESS', payload: { user: testUser } },
    );

    expect(state).toEqual(signedInState);
  });

  it('clears the user on AUTH_FAILURE', () => {
    const state = authReducer(
      { ...signedInState, isLoading: true },
      { type: 'AUTH_FAILURE' },
    );

    expect(state).toEqual(signedOutState);
  });

  it('clears the user on LOGOUT', () => {
    const state = authReducer(signedInState, { type: 'LOGOUT' });

    expect(state).toEqual(signedOutState);
  });
});
