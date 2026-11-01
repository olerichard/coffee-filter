import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { Login } from '@/components/authorization/login';
import { AuthPage } from '@/components/authorization/auth-page';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';
import { useSignupStatus } from '@/api/auth/useSignupStatus';
import { resolveRedirectTarget } from '@/lib/redirect';

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const signupStatus = useSignupStatus();

  // Also covers signing in: once the session flips this route stops rendering
  // the form and sends the user where they were headed.
  if (isAuthenticated) {
    return <Navigate to={resolveRedirectTarget(redirect)} replace />;
  }

  return (
    <AuthPage>
      <Login
        signupEnabled={signupStatus.data?.enabled ?? false}
        onCreateAccount={() => {
          void navigate({ to: '/createaccount' });
        }}
        onForgotPassword={() => {
          void navigate({ to: '/forgot-password' });
        }}
      />
    </AuthPage>
  );
}
