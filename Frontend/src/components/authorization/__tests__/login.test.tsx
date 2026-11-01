// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from '../login';

const { loginMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
}));

vi.mock('@/components/context/authentication/AuthenticationContext', () => ({
  useAuth: () => ({ login: loginMock }),
}));

function renderLogin(onForgotPassword?: () => void) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Login
        signupEnabled
        onCreateAccount={vi.fn()}
        onForgotPassword={onForgotPassword}
      />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  loginMock.mockReset();
});

describe('Login', () => {
  it('shows the sign-in error and keeps the typed email', async () => {
    loginMock.mockRejectedValueOnce(new Error('Invalid email or password.'));

    renderLogin();
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email or password.')).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe(
      'test@example.com',
    );
  });

  it('keeps the submit button enabled on an empty form', () => {
    renderLogin();

    const button = screen.getByRole('button', { name: 'Sign in' });

    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('false');
  });

  it('shows both field errors at once when submitting an empty form', async () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter your email.')).toBeTruthy();
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('does not complain about the email format while the user is typing', () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'not-an-email' },
    });

    expect(screen.queryByText('Enter a valid email address.')).toBeNull();
  });

  it('shows the email error on blur and clears it once fixed', () => {
    renderLogin();

    const email = screen.getByLabelText('Email');

    fireEvent.change(email, { target: { value: 'not-an-email' } });
    fireEvent.blur(email);

    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();

    fireEvent.change(email, { target: { value: 'test@example.com' } });

    expect(screen.queryByText('Enter a valid email address.')).toBeNull();
  });

  it('shows the error again when a touched field is emptied while focused', () => {
    renderLogin();

    const password = screen.getByLabelText('Password');

    fireEvent.change(password, { target: { value: 'coffee' } });
    fireEvent.blur(password);
    password.focus();

    expect(screen.queryByText('Enter your password.')).toBeNull();

    fireEvent.change(password, { target: { value: '' } });

    expect(screen.getByText('Enter your password.')).toBeTruthy();
  });

  it('clears the sign-in error when a field is edited', async () => {
    loginMock.mockRejectedValueOnce(new Error('Invalid email or password.'));

    renderLogin();
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email or password.')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'another-password' },
    });

    expect(screen.queryByText('Invalid email or password.')).toBeNull();
  });

  it('opens the forgot-password flow from the forgot password button', () => {
    const onForgotPassword = vi.fn();

    renderLogin(onForgotPassword);

    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));

    expect(onForgotPassword).toHaveBeenCalledTimes(1);
  });

  it('hides the forgot password button when no handler is provided', () => {
    renderLogin();

    expect(
      screen.queryByRole('button', { name: 'Forgot password?' }),
    ).toBeNull();
  });
});
