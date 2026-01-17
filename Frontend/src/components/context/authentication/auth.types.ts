export interface User {
  username: string
  email: string
  displayName?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
  email: string
  displayName?: string
}

export interface AuthContextType {
  state: AuthState
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | {
      type: 'INIT_FROM_STORAGE'
      payload: { user: User | null; token: string | null }
    }
