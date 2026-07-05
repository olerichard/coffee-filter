import { ReactNode } from 'react';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';
import { Login } from './login';
import { Card, CardContent } from '@/components/ui/card';

export const Authorization = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading)
    return (
      <AuthPage>
        <Loading />
      </AuthPage>
    );

  if (!isAuthenticated)
    return (
      <AuthPage>
        <Login />
      </AuthPage>
    );

  return <>{children}</>;
};

const Loading = () => {
  return (
    <Card>
      <CardContent className="flex justify-center text-4xl">
        <div>Loading</div>
      </CardContent>
    </Card>
  );
};

const AuthPage = ({ children }: { children: ReactNode }) => (
  <div className="pt-16">{children}</div>
);
