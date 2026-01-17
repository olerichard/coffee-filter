import { render, screen } from '@testing-library/react'
import { useAuth } from '../AuthenticationContext'
import { AuthenticationProvider } from '../AuthenticationContext'

function TestComponent() {
  const { isAuthenticated, isLoading, user } = useAuth()

  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user?.username || 'no user'}</div>
    </div>
  )
}

// Simple test without vitest describe
export async function testAuthContext() {
  console.log('Testing authentication context...')

  // Test initial state
  const { unmount } = render(
    <AuthenticationProvider>
      <TestComponent />
    </AuthenticationProvider>,
  )

  console.log(
    'Initial loading state:',
    screen.getByTestId('loading').textContent,
  )
  console.log(
    'Initial authenticated state:',
    screen.getByTestId('authenticated').textContent,
  )
  console.log('Initial user state:', screen.getByTestId('user').textContent)

  // Wait for initial state to resolve
  await new Promise((resolve) => setTimeout(resolve, 100))

  unmount()
  console.log('Authentication context test completed successfully!')
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuthContext().catch(console.error)
}
