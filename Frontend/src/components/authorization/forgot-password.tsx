import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AuthField } from '@/api/auth/types';
import type {
  FieldErrors,
  ForgotPasswordForm,
} from '@/components/authorization/authFormValidation';
import { AuthApiError, authClient } from '@/api/auth/authClient';
import {
  FORGOT_PASSWORD_FIELDS,
  forgotPasswordFormSchema,
  toFieldErrors,
  visibleFieldErrors,
} from '@/components/authorization/authFormValidation';
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

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const emptyForm: ForgotPasswordForm = { email: '' };

const allTouched: Partial<Record<AuthField, boolean>> = { email: true };

export const ForgotPassword = ({ onBackToLogin }: ForgotPasswordProps) => {
  const [form, setForm] = useState<ForgotPasswordForm>(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<AuthField, boolean>>>(
    {},
  );
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const request = useMutation({
    mutationFn: (email: string) => authClient.requestPasswordReset(email),
    onMutate: () => {
      setServerErrors({});
      setFormError(null);
    },
    onError: (error) => {
      if (error instanceof AuthApiError) {
        setServerErrors(error.fieldErrors);
        setFormError(error.hasFieldErrors ? null : error.message);
        return;
      }

      setFormError('Unable to send the reset email. Try again.');
    },
    onSuccess: (_data, email) => {
      setSentTo(email);
    },
  });

  const parsed = forgotPasswordFormSchema.safeParse(form);
  const validation = parsed.success ? {} : toFieldErrors(parsed.error);
  const errors = visibleFieldErrors(
    FORGOT_PASSWORD_FIELDS,
    touched,
    validation,
    serverErrors,
  );

  const markTouched = (field: AuthField) => {
    setTouched((current) =>
      current[field] ? current : { ...current, [field]: true },
    );
  };

  const updateField = (field: keyof ForgotPasswordForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError(null);

    setServerErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  if (sentTo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>
            If {sentTo} matches an account, we sent a link to reset your
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            The link can only be used once. If nothing arrives, check your spam
            folder and request another link.
          </p>
          <Button type="button" className="mt-6 w-full" onClick={onBackToLogin}>
            Back to sign in
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => {
              setSentTo(null);
              setForm(emptyForm);
              setTouched({});
              setServerErrors({});
              setFormError(null);
            }}
          >
            Use a different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter the email you signed up with and we will send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();

            setTouched(allTouched);

            if (request.isPending || !parsed.success) {
              return;
            }

            request.mutate(parsed.data.email);
          }}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? 'forgot-email-error' : undefined
                }
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                onBlur={() => markTouched('email')}
              />
              <FieldError id="forgot-email-error">{errors.email}</FieldError>
            </Field>
          </FieldGroup>

          {formError ? (
            <FieldError className="mt-4">{formError}</FieldError>
          ) : null}

          <Button
            type="submit"
            className="mt-6 w-full"
            aria-disabled={request.isPending}
          >
            {request.isPending ? 'Sending…' : 'Send reset link'}
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
