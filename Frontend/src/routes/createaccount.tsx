import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router';
import { Register } from '@/components/authorization/register';
import { AuthPage } from '@/components/authorization/auth-page';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';

export const Route = createFileRoute('/createaccount')({
  component: CreateAccountPage,
});

function CreateAccountPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Also covers the auto sign in after registering.
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthPage>
      <Register
        onBackToLogin={() => {
          void navigate({ to: '/login' });
        }}
      />
    </AuthPage>
  );
}
