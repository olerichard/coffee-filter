import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface LoginProps {
  signupEnabled?: boolean;
  onSwitchToRegister?: () => void;
}

export const Login = ({ signupEnabled, onSwitchToRegister }: LoginProps) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const auth = useAuth();

  const login = useMutation({
    mutationFn: auth.login,
  });

  return (
    <Card>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            login.mutate({
              email: credentials.email.trim(),
              password: credentials.password,
            });
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={credentials.email}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
            </Field>
          </FieldGroup>

          {login.isError ? (
            <p className="text-destructive mt-4 text-sm" role="alert">
              {login.error instanceof Error
                ? login.error.message
                : 'Unable to sign in. Try again.'}
            </p>
          ) : null}

          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={
              login.isPending ||
              credentials.email.length === 0 ||
              credentials.password.length === 0
            }
          >
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        {signupEnabled && onSwitchToRegister ? (
          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full"
            onClick={onSwitchToRegister}
          >
            Create account
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};
