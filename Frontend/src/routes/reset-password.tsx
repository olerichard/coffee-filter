import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { ResetPassword } from '@/components/authorization/reset-password';
import { AuthPage } from '@/components/authorization/auth-page';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute('/reset-password')({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ name: 'referrer', content: 'no-referrer' }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Resetting revokes every session, including one in this tab. Clear the
  // client session before leaving so `/login` does not bounce back to `/`.
  const backToSignIn = async () => {
    try {
      await logout();
    } catch {
      // The local session is cleared in `logout` even when the request fails.
    }

    await navigate({ to: '/login', replace: true });
  };

  return (
    <AuthPage>
      <ResetPassword
        token={token}
        onBackToSignIn={() => {
          void backToSignIn();
        }}
        onRequestNewLink={() => {
          void navigate({ to: '/forgot-password' });
        }}
      />
    </AuthPage>
  );
}
