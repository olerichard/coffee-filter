import { AuthResponseSchema, SignupStatusSchema } from './schemas';
import { refreshSession } from './sessionRefresh';
import { tokenStore } from './tokenStore';
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
} from './types';
import { apiClient } from '@/api/base/apiClient';
import { API_BASE_URL } from '@/api/base/apiConfig';

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('json')) {
      return null;
    }

    const body: unknown = await response.json();

    if (!body || typeof body !== 'object') {
      return null;
    }

    const record = body as Record<string, unknown>;

    if (typeof record.message === 'string' && record.message.length > 0) {
      return record.message;
    }

    const errors = record.errors;

    if (errors && typeof errors === 'object') {
      for (const value of Object.values(errors as Record<string, unknown>)) {
        if (!Array.isArray(value)) {
          continue;
        }

        const first = value.find(
          (item): item is string => typeof item === 'string' && item.length > 0,
        );

        if (first) {
          return first;
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

class AuthClient {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    tokenStore.clear();

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
    } catch {
      throw new Error('Unable to reach the server. Try again.');
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid email or password.');
      }

      if (response.status === 429) {
        throw new Error('Too many login attempts. Try again later.');
      }

      throw new Error('Unable to sign in. Try again.');
    }

    const data = AuthResponseSchema.parse(await response.json());
    tokenStore.setSession(data.accessToken, data.expiresAt);
    return data;
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    tokenStore.clear();

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
    } catch {
      throw new Error('Unable to reach the server. Try again.');
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many sign-up attempts. Try again later.');
      }

      const message = await readErrorMessage(response);

      if (message) {
        throw new Error(message);
      }

      if (response.status === 409) {
        throw new Error('An account with that email already exists.');
      }

      throw new Error('Unable to create your account. Try again.');
    }

    const data = AuthResponseSchema.parse(await response.json());
    tokenStore.setSession(data.accessToken, data.expiresAt);
    return data;
  }

  async signupStatus(): Promise<{ enabled: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup-status`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return { enabled: false };
      }

      return SignupStatusSchema.parse(await response.json());
    } catch {
      return { enabled: false };
    }
  }

  async refresh(): Promise<AuthResponse | null> {
    return refreshSession();
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      tokenStore.clear();
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await apiClient.fetch<void>(
        'POST',
        `${API_BASE_URL}/auth/logout-all`,
        null,
        null,
      );
    } finally {
      tokenStore.clear();
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.fetch<void>(
      'POST',
      `${API_BASE_URL}/auth/change-password`,
      request,
      null,
    );
  }
}

export const authClient = new AuthClient();
