import { AuthResponseSchema } from './schemas';
import { refreshSession } from './sessionRefresh';
import { tokenStore } from './tokenStore';
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
} from './types';
import { apiClient } from '@/api/base/apiClient';
import { API_BASE_URL } from '@/api/base/apiConfig';

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
        throw new Error('Invalid username or password.');
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
