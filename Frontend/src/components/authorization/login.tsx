import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
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
            login.mutate(credentials);
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                autoComplete="username"
                value={credentials.username}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    username: event.target.value,
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
              credentials.username.length === 0 ||
              credentials.password.length === 0
            }
          >
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
