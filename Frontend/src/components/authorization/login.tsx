import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AuthField } from '@/api/auth/types';
import type { LoginForm } from '@/components/authorization/authFormValidation';
import {
  LOGIN_FIELDS,
  loginFormSchema,
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

interface LoginProps {
  signupEnabled?: boolean;
  onCreateAccount?: () => void;
  onForgotPassword?: () => void;
}

const emptyForm: LoginForm = {
  email: '',
  password: '',
};

const allTouched: Partial<Record<AuthField, boolean>> = {
  email: true,
  password: true,
};

export const Login = ({
  signupEnabled,
  onCreateAccount,
  onForgotPassword,
}: LoginProps) => {
  const [form, setForm] = useState<LoginForm>(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<AuthField, boolean>>>(
    {},
  );

  const auth = useAuth();

  const login = useMutation({
    mutationFn: auth.login,
  });

  const parsed = loginFormSchema.safeParse(form);
  const validation = parsed.success ? {} : toFieldErrors(parsed.error);
  const errors = visibleFieldErrors(LOGIN_FIELDS, touched, validation, {});

  const markTouched = (field: AuthField) => {
    setTouched((current) =>
      current[field] ? current : { ...current, [field]: true },
    );
  };

  const updateField = (field: keyof LoginForm, value: string) => {
    if (login.isError) {
      login.reset();
    }

    setForm((current) => ({ ...current, [field]: value }));
  };

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
          noValidate
          onSubmit={(event) => {
            event.preventDefault();

            // Submitting counts as leaving every field, so the user sees all
            // problems at once instead of one at a time.
            setTouched(allTouched);

            if (login.isPending || !parsed.success) {
              return;
            }

            login.mutate({
              email: parsed.data.email,
              password: parsed.data.password,
            });
          }}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                onBlur={() => markTouched('email')}
              />
              <FieldError id="email-error">{errors.email}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                value={form.password}
                onChange={(event) =>
                  updateField('password', event.target.value)
                }
                onBlur={() => markTouched('password')}
              />
              <FieldError id="password-error">{errors.password}</FieldError>
            </Field>
          </FieldGroup>

          {login.isError ? (
            <FieldError className="mt-4">
              {login.error instanceof Error
                ? login.error.message
                : 'Unable to sign in. Try again.'}
            </FieldError>
          ) : null}

          <Button
            type="submit"
            className="mt-6 w-full"
            aria-disabled={login.isPending}
          >
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        {onForgotPassword ? (
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="link"
              size="sm"
              className="px-0"
              onClick={onForgotPassword}
            >
              Forgot password?
            </Button>
          </div>
        ) : null}

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
