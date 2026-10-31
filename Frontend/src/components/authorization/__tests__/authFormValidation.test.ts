import { describe, expect, it } from 'vitest';
import {
  loginFormSchema,
  registerFormSchema,
  toFieldErrors,
  visibleFieldErrors,
} from '../authFormValidation';

const validRegisterForm = {
  displayName: 'Test User',
  email: 'test@example.com',
  password: 'a-long-password',
  confirmPassword: 'a-long-password',
  inviteCode: 'abc',
};

function registerErrors(form: Record<string, string>) {
  const result = registerFormSchema.safeParse(form);

  if (result.success) {
    throw new Error('Expected the form to be invalid.');
  }

  return toFieldErrors(result.error);
}

function loginErrors(form: Record<string, string>) {
  const result = loginFormSchema.safeParse(form);

  if (result.success) {
    throw new Error('Expected the form to be invalid.');
  }

  return toFieldErrors(result.error);
}

describe('loginFormSchema', () => {
  it('trims the email before validating and returns the trimmed value', () => {
    const result = loginFormSchema.safeParse({
      email: '  test@example.com  ',
      password: 'coffee',
    });

    if (!result.success) {
      throw new Error(result.error.message);
    }

    expect(result.data.email).toBe('test@example.com');
  });

  it('asks for a password when it is empty', () => {
    expect(
      loginErrors({ email: 'test@example.com', password: '' }).password,
    ).toBe('Enter your password.');
  });

  it('reports a missing email before the format', () => {
    expect(loginErrors({ email: '   ', password: 'x' }).email).toBe(
      'Enter your email.',
    );
  });

  it('rejects an address without an @', () => {
    expect(loginErrors({ email: 'not-an-email', password: 'x' }).email).toBe(
      'Enter a valid email address.',
    );
  });
});

describe('registerFormSchema', () => {
  it('accepts a valid form and trims the text fields', () => {
    const result = registerFormSchema.safeParse({
      displayName: '  Test User  ',
      email: '  test@example.com  ',
      password: 'a-long-password',
      confirmPassword: 'a-long-password',
      inviteCode: '  abc  ',
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      displayName: 'Test User',
      email: 'test@example.com',
      inviteCode: 'abc',
    });
  });

  it('reports every field at once', () => {
    expect(
      registerErrors({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        inviteCode: '',
      }),
    ).toEqual({
      displayName: 'Enter a display name.',
      email: 'Enter your email.',
      password: 'Enter a password.',
      confirmPassword: 'Re-enter your password.',
      inviteCode: 'Enter your invite code.',
    });
  });

  it('requires at least 12 characters of password', () => {
    expect(
      registerErrors({
        ...validRegisterForm,
        password: 'a'.repeat(11),
        confirmPassword: 'a'.repeat(11),
      }).password,
    ).toBe('Use at least 12 characters.');
  });

  it('allows exactly 12 and 128 characters of password', () => {
    for (const length of [12, 128]) {
      const password = 'a'.repeat(length);

      expect(
        registerFormSchema.safeParse({
          ...validRegisterForm,
          password,
          confirmPassword: password,
        }).success,
      ).toBe(true);
    }
  });

  it('rejects 129 characters of password', () => {
    const password = 'a'.repeat(129);

    expect(
      registerErrors({
        ...validRegisterForm,
        password,
        confirmPassword: password,
      }).password,
    ).toBe('Use 128 characters or fewer.');
  });

  it('limits the display name to 100 characters after trimming', () => {
    expect(
      registerErrors({
        ...validRegisterForm,
        displayName: 'a'.repeat(101),
      }).displayName,
    ).toBe('Use 100 characters or fewer.');

    expect(
      registerFormSchema.safeParse({
        ...validRegisterForm,
        displayName: `  ${'a'.repeat(100)}  `,
      }).success,
    ).toBe(true);
  });

  it('limits the invite code to 512 characters after trimming', () => {
    expect(
      registerErrors({
        ...validRegisterForm,
        inviteCode: 'a'.repeat(513),
      }).inviteCode,
    ).toBe('Use 512 characters or fewer.');

    expect(
      registerFormSchema.safeParse({
        ...validRegisterForm,
        inviteCode: `  ${'a'.repeat(512)}  `,
      }).success,
    ).toBe(true);
  });

  it('reports mismatched passwords on the confirmation field', () => {
    expect(
      registerErrors({
        ...validRegisterForm,
        confirmPassword: 'something-else',
      }).confirmPassword,
    ).toBe('The passwords do not match.');
  });

  it('reports the mismatch even when another field is also invalid', () => {
    const errors = registerErrors({
      ...validRegisterForm,
      email: 'not-an-email',
      confirmPassword: 'something-else',
    });

    expect(errors.email).toBe('Enter a valid email address.');
    expect(errors.confirmPassword).toBe('The passwords do not match.');
  });

  it('does not accept an empty confirmation when the password is valid', () => {
    expect(
      registerErrors({
        ...validRegisterForm,
        confirmPassword: '',
      }).confirmPassword,
    ).toBe('Re-enter your password.');
  });
});

describe('toFieldErrors', () => {
  it('keeps only the first message per field', () => {
    const errors = registerErrors({
      displayName: '  ',
      email: '',
      password: 'short',
      confirmPassword: 'other',
      inviteCode: '',
    });

    expect(errors.displayName).toBe('Enter a display name.');
    expect(errors.email).toBe('Enter your email.');
    expect(errors.password).toBe('Use at least 12 characters.');
    expect(errors.inviteCode).toBe('Enter your invite code.');
  });
});

describe('visibleFieldErrors', () => {
  it('hides errors for fields the user has not touched', () => {
    expect(
      visibleFieldErrors(
        ['email', 'password'],
        { password: true },
        { email: 'Enter your email.', password: 'Enter your password.' },
        {},
      ),
    ).toEqual({ password: 'Enter your password.' });
  });

  it('shows server errors for touched fields without local errors', () => {
    expect(
      visibleFieldErrors(
        ['email'],
        { email: true },
        {},
        { email: 'An account with that email already exists.' },
      ),
    ).toEqual({ email: 'An account with that email already exists.' });
  });

  it('prefers the client validation over a stale server error', () => {
    expect(
      visibleFieldErrors(
        ['email'],
        { email: true },
        { email: 'Enter a valid email address.' },
        { email: 'An account with that email already exists.' },
      ),
    ).toEqual({ email: 'Enter a valid email address.' });
  });

  it('omits fields that are touched and valid', () => {
    expect(visibleFieldErrors(['email'], { email: true }, {}, {})).toEqual({});
  });
});
