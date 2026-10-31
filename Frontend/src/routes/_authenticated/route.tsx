import {
  Navigate,
  Outlet,
  createFileRoute,
  redirect,
} from '@tanstack/react-router';
import { AuthLoading, AuthPage } from '@/components/authorization/auth-page';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';
import { ensureSession } from '@/components/context/authentication/authSession';
import { resolveRedirectTarget } from '@/lib/redirect';

export const Route = createFileRoute('/_authenticated')({
  // The session lives in an httpOnly cookie the server cannot read, so the
  // guard can only run in the browser. Rendering this subtree on the client
  // makes `beforeLoad` run on a cold load instead of being skipped during
  // hydration.
  ssr: false,
  pendingComponent: AuthenticationPending,
  beforeLoad: async ({ location }) => {
    if (await ensureSession()) {
      return;
    }

    const target = resolveRedirectTarget(location.pathname);

    throw redirect({
      to: '/login',
      search: target === '/' ? {} : { redirect: target },
      replace: true,
    });
  },
  component: AuthenticatedLayout,
});

function AuthenticationPending() {
  return (
    <AuthPage>
      <AuthLoading />
    </AuthPage>
  );
}

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthenticationPending />;
  }

  // `beforeLoad` handles the initial load and navigations. This covers losing
  // the session while already rendered, for example signing out or a 401.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
