import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type {
  AuthAction,
  AuthContextType,
  AuthState,
  LoginRequest,
  RegisterRequest,
} from './auth.types';
import { authClient } from '@/api/auth/authClient';
import { broadcastLogout, subscribeToLogout } from '@/api/auth/authChannel';
import { tokenStore } from '@/api/auth/tokenStore';
import { AUTH_UNAUTHORIZED_EVENT } from '@/api/base/apiClient';

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthenticationContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthenticationProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Remove tokens written by the old localStorage-based implementation.
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    const handleUnauthorized = () => {
      tokenStore.clear();
      queryClient.clear();
      broadcastLogout();
      dispatch({ type: 'LOGOUT' });
    };

    const unsubscribeFromLogout = subscribeToLogout(() => {
      tokenStore.clear();
      queryClient.clear();
      dispatch({ type: 'LOGOUT' });
    });

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    const restoreSession = async () => {
      try {
        const response = await authClient.refresh();

        if (response) {
          queryClient.clear();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: response.user },
          });
        } else {
          tokenStore.clear();
          queryClient.clear();
          dispatch({ type: 'AUTH_FAILURE' });
        }
      } catch {
        // A network failure must not destroy the refresh cookie. The user can
        // reload or sign in again without losing the underlying session.
        tokenStore.clear();
        queryClient.clear();
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    void restoreSession();

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
      unsubscribeFromLogout();
    };
  }, [queryClient]);

  const login = async (credentials: LoginRequest) => {
    queryClient.clear();
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authClient.login(credentials);

      // A login in one tab replaces the shared refresh cookie. Sign out other
      // tabs so they cannot keep acting as the previous user.
      broadcastLogout();

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const register = async (request: RegisterRequest) => {
    queryClient.clear();
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authClient.register(request);

      // A registration sets the shared refresh cookie. Sign out other tabs so
      // they cannot keep acting as a previously signed-in user.
      broadcastLogout();

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authClient.logout();
    } finally {
      queryClient.clear();
      broadcastLogout();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const logoutAll = async () => {
    try {
      await authClient.logoutAll();
    } finally {
      queryClient.clear();
      broadcastLogout();
      dispatch({ type: 'LOGOUT' });
    }
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
