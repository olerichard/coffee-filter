import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react'
import { AuthState, AuthContextType, AuthAction, User } from './auth.types'
import { authService } from './auth.service'

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      }
    case 'INIT_FROM_STORAGE':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: !!action.payload.token && !!action.payload.user,
      }
    default:
      return state
  }
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthenticationContext = createContext<AuthContextType | undefined>(
  undefined,
)

export function AuthenticationProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = authService.getToken()
    if (token && authService.isTokenValid(token)) {
      const storedUser = localStorage.getItem('auth_user')
      const user: User | null = storedUser ? JSON.parse(storedUser) : null

      if (user) {
        dispatch({
          type: 'INIT_FROM_STORAGE',
          payload: { user, token },
        })
      } else {
        dispatch({ type: 'AUTH_FAILURE' })
        authService.removeToken()
      }
    } else {
      authService.removeToken()
      dispatch({
        type: 'INIT_FROM_STORAGE',
        payload: { user: null, token: null },
      })
    }
  }, [])

  const login = async (credentials: { username: string; password: string }) => {
    dispatch({ type: 'AUTH_START' })

    try {
      const response = await authService.login(credentials)
      const user: User = {
        username: response.username,
        email: response.email,
        displayName: response.displayName,
      }

      authService.storeToken(response.token)
      localStorage.setItem('auth_user', JSON.stringify(user))

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: response.token },
      })
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' })
      throw error
    }
  }

  const logout = () => {
    authService.removeToken()
    localStorage.removeItem('auth_user')
    dispatch({ type: 'LOGOUT' })
  }

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }

  return React.createElement(
    AuthenticationContext.Provider,
    { value: contextValue },
    children,
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthenticationContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthenticationProvider')
  }
  return context
}
