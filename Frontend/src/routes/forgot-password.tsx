import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router';
import { ForgotPassword } from '@/components/authorization/forgot-password';
import { AuthPage } from '@/components/authorization/auth-page';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthPage>
      <ForgotPassword
        onBackToLogin={() => {
          void navigate({ to: '/login' });
        }}
      />
    </AuthPage>
  );
}
