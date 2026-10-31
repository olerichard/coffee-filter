import React, {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ensureSession,
  getServerSnapshot,
  getSnapshot,
  setAnonymous,
  setAuthenticated,
  subscribe,
} from './authSession';
import type { ReactNode } from 'react';
import type {
  AuthContextType,
  AuthState,
  LoginRequest,
  RegisterRequest,
} from './auth.types';
import { authClient } from '@/api/auth/authClient';
import { broadcastLogout, subscribeToLogout } from '@/api/auth/authChannel';
import { tokenStore } from '@/api/auth/tokenStore';
import { AUTH_UNAUTHORIZED_EVENT } from '@/api/base/apiClient';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthenticationContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthenticationProvider({ children }: AuthProviderProps) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    // Remove tokens written by the old localStorage-based implementation.
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    const handleSignedOut = () => {
      tokenStore.clear();
      queryClient.clear();
      setAnonymous();
    };

    const handleUnauthorized = () => {
      broadcastLogout();
      handleSignedOut();
    };

    const unsubscribeFromLogout = subscribeToLogout(handleSignedOut);

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    // Guards call `ensureSession` too; it resolves once and both callers share
    // the result.
    void ensureSession();

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
      unsubscribeFromLogout();
    };
  }, [queryClient]);

  const login = async (credentials: LoginRequest) => {
    queryClient.clear();

    try {
      const response = await authClient.login(credentials);

      // A login in one tab replaces the shared refresh cookie. Sign out other
      // tabs so they cannot keep acting as the previous user.
      broadcastLogout();

      setAuthenticated(response.user);
    } catch (error) {
      setAnonymous();
      throw error;
    }
  };

  const register = async (request: RegisterRequest) => {
    queryClient.clear();

    try {
      const response = await authClient.register(request);

      // A registration sets the shared refresh cookie. Sign out other tabs so
      // they cannot keep acting as a previously signed-in user.
      broadcastLogout();

      setAuthenticated(response.user);
    } catch (error) {
      setAnonymous();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authClient.logout();
    } finally {
      queryClient.clear();
      broadcastLogout();
      setAnonymous();
    }
  };

  const logoutAll = async () => {
    try {
      await authClient.logoutAll();
    } finally {
      queryClient.clear();
      broadcastLogout();
      setAnonymous();
    }
  };

  const state: AuthState = {
    user: snapshot.user,
    isLoading: snapshot.status === 'unknown',
    isAuthenticated: snapshot.status === 'authenticated',
  };

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    logoutAll,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  };

  return React.createElement(
    AuthenticationContext.Provider,
    { value: contextValue },
    children,
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthenticationContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthenticationProvider');
  }

  return context;
}
