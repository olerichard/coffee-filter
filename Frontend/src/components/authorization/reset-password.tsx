import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AuthField } from '@/api/auth/types';
import type {
  FieldErrors,
  ResetPasswordForm,
} from '@/components/authorization/authFormValidation';
import { AuthApiError, authClient } from '@/api/auth/authClient';
import {
  RESET_PASSWORD_FIELDS,
  resetPasswordFormSchema,
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

interface ResetPasswordProps {
  token?: string;
  onBackToSignIn: () => void;
  onRequestNewLink: () => void;
}

const emptyForm: ResetPasswordForm = {
  newPassword: '',
  confirmPassword: '',
};

const allTouched: Partial<Record<AuthField, boolean>> = {
  newPassword: true,
  confirmPassword: true,
};

export const ResetPassword = ({
  token,
  onBackToSignIn,
  onRequestNewLink,
}: ResetPasswordProps) => {
  const [form, setForm] = useState<ResetPasswordForm>(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<AuthField, boolean>>>(
    {},
  );
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [done, setDone] = useState(false);

  const reset = useMutation({
    mutationFn: (values: ResetPasswordForm) =>
      authClient.resetPassword({
        token: token ?? '',
        newPassword: values.newPassword,
      }),
    onMutate: () => {
      setServerErrors({});
      setFormError(null);
    },
    onError: (error) => {
      if (error instanceof AuthApiError) {
        if (error.code === 'reset_token_invalid') {
          setLinkInvalid(true);
          return;
        }

        setServerErrors(error.fieldErrors);
        setFormError(error.hasFieldErrors ? null : error.message);
        return;
      }

      setFormError('Unable to reset your password. Try again.');
    },
    onSuccess: () => {
      setDone(true);
    },
  });

  const parsed = resetPasswordFormSchema.safeParse(form);
  const validation = parsed.success ? {} : toFieldErrors(parsed.error);
  const errors = visibleFieldErrors(
    RESET_PASSWORD_FIELDS,
    touched,
    validation,
    serverErrors,
  );

  const markTouched = (field: AuthField) => {
    setTouched((current) =>
      current[field] ? current : { ...current, [field]: true },
    );
  };

  const updateField = (field: keyof ResetPasswordForm, value: string) => {
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

  if (!token || linkInvalid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {linkInvalid ? 'Reset link no longer valid' : 'Reset link missing'}
          </CardTitle>
          <CardDescription>
            {linkInvalid
              ? 'This link may have expired or already been used. Request a new one to continue.'
              : 'This page needs a reset link from your email. Request a new one to continue.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" className="w-full" onClick={onRequestNewLink}>
            Request a new link
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full"
            onClick={onBackToSignIn}
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password updated</CardTitle>
          <CardDescription>
            Your new password is active. Every session has been signed out,
            including this one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" className="w-full" onClick={onBackToSignIn}>
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          Use at least 12 characters. This signs you out everywhere.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();

            setTouched(allTouched);

            if (reset.isPending || !parsed.success) {
              return;
            }

            reset.mutate(parsed.data);
          }}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.newPassword)}>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.newPassword)}
                aria-describedby={
                  errors.newPassword ? 'new-password-error' : undefined
                }
                value={form.newPassword}
                onChange={(event) =>
                  updateField('newPassword', event.target.value)
                }
                onBlur={() => markTouched('newPassword')}
              />
              <FieldError id="new-password-error">
                {errors.newPassword}
              </FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.confirmPassword)}>
              <FieldLabel htmlFor="confirm-new-password">
                Confirm new password
              </FieldLabel>
              <Input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword
                    ? 'confirm-new-password-error'
                    : undefined
                }
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField('confirmPassword', event.target.value)
                }
                onBlur={() => markTouched('confirmPassword')}
              />
              <FieldError id="confirm-new-password-error">
                {errors.confirmPassword}
              </FieldError>
            </Field>
          </FieldGroup>

          {formError ? (
            <FieldError className="mt-4">{formError}</FieldError>
          ) : null}

          <Button
            type="submit"
            className="mt-6 w-full"
            aria-disabled={reset.isPending}
          >
            {reset.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
