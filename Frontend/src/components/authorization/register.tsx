import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AuthField } from '@/api/auth/types';
import { AuthApiError } from '@/api/auth/authClient';
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
  onBackToLogin: () => void;
}

type RegisterForm = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
};

type FieldErrors = Partial<Record<AuthField, string>>;

const emptyForm: RegisterForm = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
};

export const Register = ({ onBackToLogin }: RegisterProps) => {
  const [form, setForm] = useState<RegisterForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [signupDisabled, setSignupDisabled] = useState(false);

  const auth = useAuth();

  const register = useMutation({
    mutationFn: auth.register,
    onMutate: () => {
      setFieldErrors({});
      setFormError(null);
    },
    onError: (error) => {
      if (error instanceof AuthApiError) {
        setFieldErrors(error.fieldErrors);
        setFormError(error.hasFieldErrors ? null : error.message);

        if (error.code === 'signup_disabled') {
          setSignupDisabled(true);
        }

        return;
      }

      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to create your account. Try again.',
      );
    },
  });

  const updateField = (field: keyof RegisterForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError(null);

    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const localPasswordError =
    form.password.length > 0 && form.password.length < 12
      ? 'Use at least 12 characters for your password.'
      : undefined;

  const localConfirmPasswordError =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword
      ? 'The passwords do not match.'
      : undefined;

  const passwordError = fieldErrors.password ?? localPasswordError;
  const confirmPasswordError =
    fieldErrors.confirmPassword ?? localConfirmPasswordError;

  const canSubmit =
    form.displayName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length >= 12 &&
    form.password === form.confirmPassword &&
    form.inviteCode.trim().length > 0 &&
    !register.isPending;

  if (signupDisabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign-up is disabled</CardTitle>
          <CardDescription>
            New accounts cannot be created right now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" className="w-full" onClick={onBackToLogin}>
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

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
            <Field data-invalid={Boolean(fieldErrors.displayName)}>
              <FieldLabel htmlFor="display-name">Display name</FieldLabel>
              <Input
                id="display-name"
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.displayName)}
                aria-describedby={
                  fieldErrors.displayName ? 'display-name-error' : undefined
                }
                value={form.displayName}
                onChange={(event) =>
                  updateField('displayName', event.target.value)
                }
              />
              <FieldError id="display-name-error">
                {fieldErrors.displayName}
              </FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.email)}>
              <FieldLabel htmlFor="register-email">Email</FieldLabel>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={
                  fieldErrors.email ? 'register-email-error' : undefined
                }
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
              <FieldError id="register-email-error">
                {fieldErrors.email}
              </FieldError>
            </Field>
            <Field data-invalid={Boolean(passwordError)}>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={
                  passwordError ? 'register-password-error' : undefined
                }
                value={form.password}
                onChange={(event) =>
                  updateField('password', event.target.value)
                }
              />
              <FieldError id="register-password-error">
                {passwordError}
              </FieldError>
            </Field>
            <Field data-invalid={Boolean(confirmPasswordError)}>
              <FieldLabel htmlFor="register-confirm-password">
                Confirm password
              </FieldLabel>
              <Input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(confirmPasswordError)}
                aria-describedby={
                  confirmPasswordError
                    ? 'register-confirm-password-error'
                    : undefined
                }
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField('confirmPassword', event.target.value)
                }
              />
              <FieldError id="register-confirm-password-error">
                {confirmPasswordError}
              </FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.inviteCode)}>
              <FieldLabel htmlFor="invite-code">Invite code</FieldLabel>
              <Input
                id="invite-code"
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                aria-invalid={Boolean(fieldErrors.inviteCode)}
                aria-describedby={
                  fieldErrors.inviteCode ? 'invite-code-error' : undefined
                }
                value={form.inviteCode}
                onChange={(event) =>
                  updateField('inviteCode', event.target.value)
                }
              />
              <FieldError id="invite-code-error">
                {fieldErrors.inviteCode}
              </FieldError>
            </Field>
          </FieldGroup>

          {formError ? (
            <FieldError className="mt-4">{formError}</FieldError>
          ) : null}

          <Button type="submit" className="mt-6 w-full" disabled={!canSubmit}>
            {register.isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full"
          onClick={onBackToLogin}
        >
          Back to sign in
        </Button>
      </CardContent>
    </Card>
  );
};
