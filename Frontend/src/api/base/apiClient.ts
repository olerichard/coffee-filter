import { API_BASE_URL } from './apiConfig';
import type { ZodType } from 'zod';

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

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async fetch<T extends unknown>(
    method: 'PUT' | 'POST' | 'GET' | 'DELETE',
    url: string,
    body: Record<string, unknown> | null,
    schema: ZodType | null,
  ) {
    const res = await fetch(
      new Request(url, {
        headers: this.getHeaders(),
        method: method,
        body: body ? JSON.stringify(body) : null,
      }),
    );

    if (res.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
    }

    if (!res.ok) throw res;

    const data = await res.json();
    return (schema ? schema.parse(data) : data) as T;
  }
}

export const apiClient = new ApiClient();
