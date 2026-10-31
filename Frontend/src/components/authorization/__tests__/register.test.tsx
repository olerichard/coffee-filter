// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Register } from '../register';
import { AuthApiError } from '@/api/auth/authClient';

const { registerMock } = vi.hoisted(() => ({
  registerMock: vi.fn(),
}));

vi.mock('@/components/context/authentication/AuthenticationContext', () => ({
  useAuth: () => ({ register: registerMock }),
}));

function renderRegister() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Register onBackToLogin={vi.fn()} />
    </QueryClientProvider>,
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText('Display name'), {
    target: { value: 'Test User' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'a-long-password' },
  });
  fireEvent.change(screen.getByLabelText('Confirm password'), {
    target: { value: 'a-long-password' },
  });
  fireEvent.change(screen.getByLabelText('Invite code'), {
    target: { value: 'abc' },
  });
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

afterEach(() => {
  cleanup();
  registerMock.mockReset();
});

describe('Register', () => {
  it('shows a duplicate email on the email field', async () => {
    registerMock.mockRejectedValueOnce(
      new AuthApiError({
        status: 409,
        code: 'email_exists',
        message: 'An account with that email already exists.',
        fieldErrors: {
          email: 'An account with that email already exists.',
        },
      }),
    );

    renderRegister();
    fillValidForm();
    submit();

    expect(
      await screen.findByText('An account with that email already exists.'),
    ).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe(
      'test@example.com',
    );
  });

  it('shows an invalid invite code on the invite code field', async () => {
    registerMock.mockRejectedValueOnce(
      new AuthApiError({
        status: 400,
        code: 'invite_code_invalid',
        message: 'That invite code is not valid.',
        fieldErrors: { inviteCode: 'That invite code is not valid.' },
      }),
    );

    renderRegister();
    fillValidForm();
    submit();

    expect(
      await screen.findByText('That invite code is not valid.'),
    ).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Invite code').value).toBe(
      'abc',
    );
  });

  it('shows server side password validation on the password field', async () => {
    registerMock.mockRejectedValueOnce(
      new AuthApiError({
        status: 400,
        message: 'The password must be at least 12 characters.',
        fieldErrors: {
          password: 'The password must be at least 12 characters.',
        },
      }),
    );

    renderRegister();
    fillValidForm();
    submit();

    expect(
      await screen.findByText('The password must be at least 12 characters.'),
    ).toBeTruthy();
  });

  it('keeps the form when sign-up is disabled', async () => {
    registerMock.mockRejectedValueOnce(
      new AuthApiError({
        status: 403,
        code: 'signup_disabled',
        message: 'Sign-up is disabled.',
      }),
    );

    renderRegister();
    fillValidForm();
    submit();

    expect(await screen.findByText('Sign-up is disabled')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Back to sign in' }),
    ).toBeTruthy();
  });

  it('submits the trimmed values once', async () => {
    registerMock.mockResolvedValueOnce(undefined);

    renderRegister();
    fillValidForm();
    submit();

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledTimes(1);
    });

    expect(registerMock.mock.calls[0]?.[0]).toEqual({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'a-long-password',
      inviteCode: 'abc',
    });
  });

  it('keeps the submit button enabled on an empty form', () => {
    renderRegister();

    const button = screen.getByRole('button', { name: 'Create account' });

    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('false');
  });

  it('shows every field error at once when submitting an empty form', async () => {
    renderRegister();
    submit();

    expect(await screen.findByText('Enter a display name.')).toBeTruthy();
    expect(screen.getByText('Enter your email.')).toBeTruthy();
    expect(screen.getByText('Enter a password.')).toBeTruthy();
    expect(screen.getByText('Re-enter your password.')).toBeTruthy();
    expect(screen.getByText('Enter your invite code.')).toBeTruthy();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('does not complain about the email format while the user is typing', () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'not-an-email' },
    });

    expect(screen.queryByText('Enter a valid email address.')).toBeNull();
  });

  it('shows the email error on blur and clears it once fixed', () => {
    renderRegister();

    const email = screen.getByLabelText('Email');

    fireEvent.change(email, { target: { value: 'not-an-email' } });
    fireEvent.blur(email);

    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();

    fireEvent.change(email, { target: { value: 'test@example.com' } });

    expect(screen.queryByText('Enter a valid email address.')).toBeNull();
  });

  it('shows the error again when a touched field is emptied while focused', () => {
    renderRegister();

    const email = screen.getByLabelText('Email');

    fireEvent.change(email, { target: { value: 'test@example.com' } });
    fireEvent.blur(email);
    email.focus();

    expect(screen.queryByText('Enter your email.')).toBeNull();

    fireEvent.change(email, { target: { value: '' } });

    expect(screen.getByText('Enter your email.')).toBeTruthy();
  });

  it('clears a server error when the field is edited', async () => {
    registerMock.mockRejectedValueOnce(
      new AuthApiError({
        status: 409,
        code: 'email_exists',
        message: 'An account with that email already exists.',
        fieldErrors: {
          email: 'An account with that email already exists.',
        },
      }),
    );

    renderRegister();
    fillValidForm();
    submit();

    expect(
      await screen.findByText('An account with that email already exists.'),
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'other@example.com' },
    });

    expect(
      screen.queryByText('An account with that email already exists.'),
    ).toBeNull();
  });
});
