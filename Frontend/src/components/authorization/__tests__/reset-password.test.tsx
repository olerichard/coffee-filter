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
import { ResetPassword } from '../reset-password';
import type * as AuthClientModule from '@/api/auth/authClient';
import { AuthApiError } from '@/api/auth/authClient';

const { resetMock } = vi.hoisted(() => ({
  resetMock: vi.fn(),
}));

vi.mock('@/api/auth/authClient', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthClientModule>();

  return {
    ...actual,
    authClient: {
      ...actual.authClient,
      resetPassword: resetMock,
    },
  };
});

function renderResetPassword(token: string | null = 'raw-token') {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const onBackToSignIn = vi.fn();
  const onRequestNewLink = vi.fn();

  render(
    <QueryClientProvider client={queryClient}>
      <ResetPassword
        token={token ?? undefined}
        onBackToSignIn={onBackToSignIn}
        onRequestNewLink={onRequestNewLink}
      />
    </QueryClientProvider>,
  );

  return { onBackToSignIn, onRequestNewLink };
}

function fillForm(newPassword: string, confirmPassword = newPassword) {
  fireEvent.change(screen.getByLabelText('New password'), {
    target: { value: newPassword },
  });
  fireEvent.change(screen.getByLabelText('Confirm new password'), {
    target: { value: confirmPassword },
  });
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
}

afterEach(() => {
  cleanup();
  resetMock.mockReset();
});

describe('ResetPassword', () => {
  it('asks for a new link when the token is missing', () => {
    renderResetPassword(null);

    expect(screen.getByText('Reset link missing')).toBeTruthy();
    expect(screen.queryByLabelText('New password')).toBeNull();
  });

  it('navigates to the request page from the missing-token card', () => {
    const { onRequestNewLink } = renderResetPassword(null);

    fireEvent.click(screen.getByRole('button', { name: 'Request a new link' }));

    expect(onRequestNewLink).toHaveBeenCalledTimes(1);
  });

  it('keeps the submit button enabled on an empty form', () => {
    renderResetPassword();

    const button = screen.getByRole('button', { name: 'Update password' });

    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('false');
  });

  it('shows both field errors at once on an empty submit', async () => {
    renderResetPassword();
    submit();

    expect(await screen.findByText('Enter a new password.')).toBeTruthy();
    expect(screen.getByText('Re-enter your new password.')).toBeTruthy();
    expect(resetMock).not.toHaveBeenCalled();
  });

  it('stays quiet about a short password until the field is blurred', () => {
    renderResetPassword();

    const password = screen.getByLabelText('New password');

    fireEvent.change(password, { target: { value: 'short' } });

    expect(screen.queryByText('Use at least 12 characters.')).toBeNull();

    fireEvent.blur(password);

    expect(screen.getByText('Use at least 12 characters.')).toBeTruthy();
  });

  it('reports mismatched passwords on the confirmation field', async () => {
    renderResetPassword();
    fillForm('a-long-password', 'something-else');
    submit();

    expect(await screen.findByText('The passwords do not match.')).toBeTruthy();
    expect(resetMock).not.toHaveBeenCalled();
  });

  it('submits the token and new password, then shows the success card', async () => {
    resetMock.mockResolvedValueOnce(undefined);

    renderResetPassword('raw-token');
    fillForm('a-long-password');
    submit();

    await waitFor(() => {
      expect(resetMock).toHaveBeenCalledWith({
        token: 'raw-token',
        newPassword: 'a-long-password',
      });
    });

    expect(await screen.findByText('Password updated')).toBeTruthy();
  });

  it('returns to sign in from the success card', async () => {
    resetMock.mockResolvedValueOnce(undefined);

    const { onBackToSignIn } = renderResetPassword();
    fillForm('a-long-password');
    submit();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Back to sign in' }),
    );

    expect(onBackToSignIn).toHaveBeenCalledTimes(1);
  });

  it('shows the invalid-link card when the server rejects the token', async () => {
    resetMock.mockRejectedValueOnce(
      new AuthApiError({
        status: 400,
        code: 'reset_token_invalid',
        message: 'This reset link is no longer valid. Request a new one.',
      }),
    );

    renderResetPassword();
    fillForm('a-long-password');
    submit();

    expect(await screen.findByText('Reset link no longer valid')).toBeTruthy();
    expect(screen.queryByLabelText('New password')).toBeNull();
  });

  it('shows a generic message on an unexpected failure', async () => {
    resetMock.mockRejectedValueOnce(new Error('offline'));

    renderResetPassword();
    fillForm('a-long-password');
    submit();

    expect(
      await screen.findByText('Unable to reset your password. Try again.'),
    ).toBeTruthy();
    expect(screen.queryByText('Password updated')).toBeNull();
  });
});
