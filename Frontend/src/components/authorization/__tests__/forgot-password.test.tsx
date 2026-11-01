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
import { ForgotPassword } from '../forgot-password';
import type * as AuthClientModule from '@/api/auth/authClient';
import { AuthApiError } from '@/api/auth/authClient';

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}));

vi.mock('@/api/auth/authClient', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthClientModule>();

  return {
    ...actual,
    authClient: {
      ...actual.authClient,
      requestPasswordReset: requestMock,
    },
  };
});

function renderForgotPassword(onBackToLogin = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <ForgotPassword onBackToLogin={onBackToLogin} />
    </QueryClientProvider>,
  );

  return { onBackToLogin };
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
}

afterEach(() => {
  cleanup();
  requestMock.mockReset();
});

describe('ForgotPassword', () => {
  it('keeps the submit button enabled on an empty form', () => {
    renderForgotPassword();

    const button = screen.getByRole('button', { name: 'Send reset link' });

    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('false');
  });

  it('shows the required error on an empty submit without calling the API', async () => {
    renderForgotPassword();
    submit();

    expect(await screen.findByText('Enter your email.')).toBeTruthy();
    expect(requestMock).not.toHaveBeenCalled();
  });

  it('does not complain about the format while the user is typing', () => {
    renderForgotPassword();

    const email = screen.getByLabelText('Email');

    fireEvent.change(email, { target: { value: 'not-an-email' } });

    expect(screen.queryByText('Enter a valid email address.')).toBeNull();

    fireEvent.blur(email);

    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  });

  it('sends the trimmed email and shows the generic confirmation', async () => {
    requestMock.mockResolvedValueOnce(undefined);

    renderForgotPassword();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: '  test@example.com  ' },
    });
    submit();

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalledWith('test@example.com');
    });

    expect(await screen.findByText(/matches an account/)).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Use a different email' }),
    ).toBeTruthy();
  });

  it('returns to the form when the user wants another email', async () => {
    requestMock.mockResolvedValueOnce(undefined);

    renderForgotPassword();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    submit();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Use a different email' }),
    );

    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe('');
  });

  it('shows the rate limit message from the server', async () => {
    requestMock.mockRejectedValueOnce(
      new AuthApiError({
        status: 429,
        code: 'rate_limited',
        message: 'Too many attempts. Try again later.',
      }),
    );

    renderForgotPassword();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    submit();

    expect(
      await screen.findByText('Too many attempts. Try again later.'),
    ).toBeTruthy();
  });

  it('shows a generic message on an unexpected failure', async () => {
    requestMock.mockRejectedValueOnce(new Error('offline'));

    renderForgotPassword();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    submit();

    expect(
      await screen.findByText('Unable to send the reset email. Try again.'),
    ).toBeTruthy();
  });
});
