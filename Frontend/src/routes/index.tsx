import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/components/context/authentication/AuthenticationContext'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: App,
  beforeLoad: () => {},
})

function App() {
  const navigate = useNavigate()
  const { isAuthenticated, user, isLoading, logout } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  useEffect(() => {
    if (isAuthenticated) return

    navigate({ to: '/login', replace: true })
  }, [isAuthenticated])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Coffee Filter</h1>
        <div className="space-y-2">
          <div className="text-center">
            <span className="text-sm">
              Status:{' '}
              <span className="font-semibold text-green-600">
                Authenticated
              </span>
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm">User: {user?.username}</p>
            <p className="text-sm">Email: {user?.email}</p>
            {user?.displayName && (
              <p className="text-sm">Display: {user.displayName}</p>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
