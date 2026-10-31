import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface LoginProps {
  signupEnabled?: boolean;
  onCreateAccount?: () => void;
}

export const Login = ({ signupEnabled, onCreateAccount }: LoginProps) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const auth = useAuth();

  const login = useMutation({
    mutationFn: auth.login,
  });

  const canSubmit =
    credentials.email.trim().length > 0 &&
    credentials.password.length > 0 &&
    !login.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use the email and password you signed up with.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (!canSubmit) {
              return;
            }

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
                onChange={(event) => {
                  if (login.isError) {
                    login.reset();
                  }

                  setCredentials((current) => ({
                    ...current,
                    email: event.target.value,
                  }));
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={(event) => {
                  if (login.isError) {
                    login.reset();
                  }

                  setCredentials((current) => ({
                    ...current,
                    password: event.target.value,
                  }));
                }}
              />
            </Field>
          </FieldGroup>

          {login.isError ? (
            <FieldError className="mt-4">
              {login.error instanceof Error
                ? login.error.message
                : 'Unable to sign in. Try again.'}
            </FieldError>
          ) : null}

          <Button type="submit" className="mt-6 w-full" disabled={!canSubmit}>
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        {signupEnabled && onCreateAccount ? (
          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full"
            onClick={onCreateAccount}
          >
            Create account
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};
