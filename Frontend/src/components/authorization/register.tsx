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

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export const Register = ({ onSwitchToLogin }: RegisterProps) => {
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
  });

  const auth = useAuth();

  const register = useMutation({
    mutationFn: auth.register,
  });

  const passwordTooShort =
    form.password.length > 0 && form.password.length < 12;
  const passwordMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const canSubmit =
    form.displayName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length >= 12 &&
    form.password === form.confirmPassword &&
    form.inviteCode.trim().length > 0 &&
    !register.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>You need an invite code to sign up.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (!canSubmit) {
              return;
            }

            register.mutate({
              displayName: form.displayName.trim(),
              email: form.email.trim(),
              password: form.password,
              inviteCode: form.inviteCode.trim(),
            });
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="display-name">Display name</FieldLabel>
              <Input
                id="display-name"
                autoComplete="name"
                value={form.displayName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="register-email">Email</FieldLabel>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="register-confirm-password">
                Confirm password
              </FieldLabel>
              <Input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-code">Invite code</FieldLabel>
              <Input
                id="invite-code"
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                value={form.inviteCode}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    inviteCode: event.target.value,
                  }))
                }
              />
            </Field>
          </FieldGroup>

          {passwordTooShort ? (
            <FieldError className="mt-3">
              Use at least 12 characters for your password.
            </FieldError>
          ) : null}

          {passwordMismatch ? (
            <FieldError className="mt-3">
              The passwords do not match.
            </FieldError>
          ) : null}

          {register.isError ? (
            <p className="text-destructive mt-4 text-sm" role="alert">
              {register.error instanceof Error
                ? register.error.message
                : 'Unable to create your account. Try again.'}
            </p>
          ) : null}

          <Button type="submit" className="mt-6 w-full" disabled={!canSubmit}>
            {register.isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full"
          onClick={onSwitchToLogin}
        >
          Back to sign in
        </Button>
      </CardContent>
    </Card>
  );
};
