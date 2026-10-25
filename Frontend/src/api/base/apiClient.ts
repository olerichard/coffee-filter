import { API_BASE_URL } from './apiConfig';
import type { ZodType } from 'zod';
import { refreshSession } from '@/api/auth/sessionRefresh';
import { tokenStore } from '@/api/auth/tokenStore';

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

class ApiClient {
  private BASE_URL = API_BASE_URL;

  buildUrl(...args: Array<string>) {
    return args.length === 0
      ? this.BASE_URL
      : `${this.BASE_URL}/${args.join('/')}`;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = tokenStore.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    //test
    return headers;
  }

  async fetch<T extends unknown>(
    method: 'PUT' | 'POST' | 'GET' | 'DELETE',
    url: string,
    body: unknown,
    schema: ZodType | null,
  ) {
    let response = await this.send(method, url, body);

    if (response.status === 401 && typeof window !== 'undefined') {
      const refreshed = await refreshSession();

      if (refreshed) {
        response = await this.send(method, url, body);
      }
    }

    if (response.status === 401) {
      tokenStore.clear();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
      }
    }

    if (!response.ok) throw response;

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    const data = JSON.parse(text);
    return (schema ? schema.parse(data) : data) as T;
  }

  private send(
    method: 'PUT' | 'POST' | 'GET' | 'DELETE',
    url: string,
    body: unknown,
  ) {
    return fetch(
      new Request(url, {
        headers: this.getHeaders(),
        method: method,
        body: body ? JSON.stringify(body) : null,
      }),
    );
  }
}

export const apiClient = new ApiClient();
