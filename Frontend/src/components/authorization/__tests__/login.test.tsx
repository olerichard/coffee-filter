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

function renderLogin() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Login signupEnabled onCreateAccount={vi.fn()} />
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
});
