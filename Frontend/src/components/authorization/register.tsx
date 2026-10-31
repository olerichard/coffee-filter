import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AuthField } from '@/api/auth/types';
import type {
  FieldErrors,
  RegisterForm,
} from '@/components/authorization/authFormValidation';
import { AuthApiError } from '@/api/auth/authClient';
import {
  REGISTER_FIELDS,
  registerFormSchema,
  toFieldErrors,
  visibleFieldErrors,
} from '@/components/authorization/authFormValidation';
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

const emptyForm: RegisterForm = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
};

const allTouched = Object.fromEntries(
  REGISTER_FIELDS.map((field) => [field, true]),
) as Partial<Record<AuthField, boolean>>;

export const Register = ({ onBackToLogin }: RegisterProps) => {
  const [form, setForm] = useState<RegisterForm>(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<AuthField, boolean>>>(
    {},
  );
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [signupDisabled, setSignupDisabled] = useState(false);

  const auth = useAuth();

  const register = useMutation({
    mutationFn: auth.register,
    onMutate: () => {
      setServerErrors({});
      setFormError(null);
    },
    onError: (error) => {
      if (error instanceof AuthApiError) {
        setServerErrors(error.fieldErrors);
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

  const parsed = registerFormSchema.safeParse(form);
  const validation = parsed.success ? {} : toFieldErrors(parsed.error);
  const errors = visibleFieldErrors(
    REGISTER_FIELDS,
    touched,
    validation,
    serverErrors,
  );

  const markTouched = (field: AuthField) => {
    setTouched((current) =>
      current[field] ? current : { ...current, [field]: true },
    );
  };

  const updateField = (field: keyof RegisterForm, value: string) => {
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
          noValidate
          onSubmit={(event) => {
            event.preventDefault();

            // Submitting counts as leaving every field, so the user sees all
            // problems at once instead of one at a time.
            setTouched(allTouched);

            if (register.isPending || !parsed.success) {
              return;
            }

            register.mutate({
              displayName: parsed.data.displayName,
              email: parsed.data.email,
              password: parsed.data.password,
              inviteCode: parsed.data.inviteCode,
            });
          }}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.displayName)}>
              <FieldLabel htmlFor="display-name">Display name</FieldLabel>
              <Input
                id="display-name"
                autoComplete="name"
                aria-invalid={Boolean(errors.displayName)}
                aria-describedby={
                  errors.displayName ? 'display-name-error' : undefined
                }
                value={form.displayName}
                onChange={(event) =>
                  updateField('displayName', event.target.value)
                }
                onBlur={() => markTouched('displayName')}
              />
              <FieldError id="display-name-error">
                {errors.displayName}
              </FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="register-email">Email</FieldLabel>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? 'register-email-error' : undefined
                }
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                onBlur={() => markTouched('email')}
              />
              <FieldError id="register-email-error">{errors.email}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'register-password-error' : undefined
                }
                value={form.password}
                onChange={(event) =>
                  updateField('password', event.target.value)
                }
                onBlur={() => markTouched('password')}
              />
              <FieldError id="register-password-error">
                {errors.password}
              </FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.confirmPassword)}>
              <FieldLabel htmlFor="register-confirm-password">
                Confirm password
              </FieldLabel>
              <Input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword
                    ? 'register-confirm-password-error'
                    : undefined
                }
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField('confirmPassword', event.target.value)
                }
                onBlur={() => markTouched('confirmPassword')}
              />
              <FieldError id="register-confirm-password-error">
                {errors.confirmPassword}
              </FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.inviteCode)}>
              <FieldLabel htmlFor="invite-code">Invite code</FieldLabel>
              <Input
                id="invite-code"
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                aria-invalid={Boolean(errors.inviteCode)}
                aria-describedby={
                  errors.inviteCode ? 'invite-code-error' : undefined
                }
                value={form.inviteCode}
                onChange={(event) =>
                  updateField('inviteCode', event.target.value)
                }
                onBlur={() => markTouched('inviteCode')}
              />
              <FieldError id="invite-code-error">
                {errors.inviteCode}
              </FieldError>
            </Field>
          </FieldGroup>

          {formError ? (
            <FieldError className="mt-4">{formError}</FieldError>
          ) : null}

          <Button
            type="submit"
            className="mt-6 w-full"
            aria-disabled={register.isPending}
          >
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
