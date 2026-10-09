import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { Suspense, lazy } from 'react';

import appCss from '../styles.css?url';

import type { QueryClient } from '@tanstack/react-query';
import { Authorization } from '@/components/authorization/authorization';
import { ThemeProvider } from '@/components/context/themeContext/ThemeProvider';
import { BaseLayout } from '@/components/layout/BaseLayout';

interface RouterContext {
  queryClient: QueryClient;
}

const Devtools = import.meta.env.DEV
  ? lazy(() => import('@/components/devtools/Devtools'))
  : null;

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Coffee Filter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
});

function RootLayout() {
  return <Outlet />;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <BaseLayout>
            <Authorization>{children}</Authorization>
          </BaseLayout>
        </ThemeProvider>
        {Devtools ? (
          <Suspense fallback={null}>
            <Devtools />
          </Suspense>
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}
