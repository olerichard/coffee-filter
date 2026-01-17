import { createRouter } from '@tanstack/react-router'
import * as TanstackQuery from './integrations/tanstack-query/root-provider'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { AuthenticationProvider } from './components/context/authentication/AuthenticationContext'

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext()

  const router = createRouter({
    routeTree,
    context: { ...rqContext },
    defaultPreload: 'intent',
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <TanstackQuery.QueryProvider {...rqContext}>
          <AuthenticationProvider>{props.children}</AuthenticationProvider>
        </TanstackQuery.QueryProvider>
      )
    },
  })

  return router
}
