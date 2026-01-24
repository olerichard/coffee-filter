import { createRouter } from '@tanstack/react-router';
import * as Query from './integrations/tanstack-query/root-provider';

import { routeTree } from './routeTree.gen';
import { AuthenticationProvider } from './components/context/authentication/AuthenticationContext';

export const getRouter = () => {
  const rqContext = Query.getContext();

  const router = createRouter({
    routeTree,
    context: { ...rqContext },
    defaultPreload: 'intent',
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <Query.QueryProvider {...rqContext}>
          <AuthenticationProvider>{props.children}</AuthenticationProvider>
        </Query.QueryProvider>
      );
    },
  });

  return router;
};
