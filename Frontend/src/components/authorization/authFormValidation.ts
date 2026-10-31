import { z } from 'zod';
import type { AuthField } from '@/api/auth/types';

export const LOGIN_FIELDS = [
  'email',
  'password',
] as const satisfies ReadonlyArray<AuthField>;

export const REGISTER_FIELDS = [
  'displayName',
  'email',
  'password',
  'confirmPassword',
  'inviteCode',
] as const satisfies ReadonlyArray<AuthField>;

const emailSchema = z
  .email('Enter a valid email address.')
  .max(254, 'Use 254 characters or fewer.');

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
});

export const registerFormSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, 'Enter a display name.')
      .max(100, 'Use 100 characters or fewer.'),
    email: emailSchema,
    password: z
      .string()
      .min(1, 'Enter a password.')
      .min(12, 'Use at least 12 characters.')
      .max(128, 'Use 128 characters or fewer.'),
    confirmPassword: z.string().min(1, 'Re-enter your password.'),
    inviteCode: z
      .string()
      .trim()
      .min(1, 'Enter your invite code.')
      .max(512, 'Use 512 characters or fewer.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'The passwords do not match.',
    path: ['confirmPassword'],
  });

export type LoginForm = z.infer<typeof loginFormSchema>;
export type RegisterForm = z.infer<typeof registerFormSchema>;

export type FieldErrors = Partial<Record<AuthField, string>>;

/** Keeps only the first issue per field so each input shows one message. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const [field] = issue.path;

    if (typeof field !== 'string' || field in errors) {
      continue;
    }

    errors[field as AuthField] = issue.message;
  }

  return errors;
}

/**
 * Merges client and server messages for display. A field only shows an error
 * once the user has touched it, and the client validation wins because it
 * reflects the value currently typed in the form.
 */
export function visibleFieldErrors(
  fields: ReadonlyArray<AuthField>,
  touched: Readonly<Partial<Record<AuthField, boolean>>>,
  validation: FieldErrors,
  server: FieldErrors,
): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of fields) {
    if (!touched[field]) {
      continue;
    }

    const message = validation[field] ?? server[field];

    if (message) {
      errors[field] = message;
    }
  }

  return errors;
}
