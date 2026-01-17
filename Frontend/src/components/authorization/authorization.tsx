import { ReactNode } from 'react'
import { useAuth } from '../context/authentication/AuthenticationContext'
import { Login } from './login'

export const Authorization = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <div>LOADING</div>

  if (!isAuthenticated) return <Login />

  return <>{children}</>
}
