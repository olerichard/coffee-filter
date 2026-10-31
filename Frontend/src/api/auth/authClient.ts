import { AuthResponseSchema, SignupStatusSchema } from './schemas';
import { refreshSession } from './sessionRefresh';
import { tokenStore } from './tokenStore';
import type {
  AuthField,
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
} from './types';
import { apiClient } from '@/api/base/apiClient';
import { API_BASE_URL } from '@/api/base/apiConfig';

interface AuthApiErrorOptions {
  status: number;
  code?: string | null;
  message: string;
  fieldErrors?: Partial<Record<AuthField, string>>;
}

/**
 * Error thrown by the auth endpoints. Carries enough structure for the forms to
 * put each server-side problem next to the input that caused it.
 */
export class AuthApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly fieldErrors: Partial<Record<AuthField, string>>;

  constructor({ status, code, message, fieldErrors }: AuthApiErrorOptions) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.code = code ?? null;
    this.fieldErrors = fieldErrors ?? {};
  }

  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }
}

const FIELD_NAMES: Partial<Record<string, AuthField>> = {
  email: 'email',
  password: 'password',
  displayname: 'displayName',
  confirmpassword: 'confirmPassword',
  invitecode: 'inviteCode',
};

async function readJsonBody(
  response: Response,
): Promise<Record<string, unknown> | null> {
  try {
    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('json')) {
      return null;
    }

    const body: unknown = await response.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Turns an unsuccessful auth response into an AuthApiError. Field level
 * problems end up in `fieldErrors`, everything else in `message`.
 */
export async function parseAuthError(
  response: Response,
  fallbackMessage: string,
): Promise<AuthApiError> {
  const body = await readJsonBody(response);
  const fieldErrors: Partial<Record<AuthField, string>> = {};
  let code: string | null = null;
  let message: string | null = null;

  if (body) {
    if (typeof body.code === 'string') {
      code = body.code;
    }

    if (typeof body.message === 'string' && body.message.length > 0) {
      message = body.message;
    }

    const errors = body.errors;

    if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
      for (const [key, value] of Object.entries(
        errors as Record<string, unknown>,
      )) {
        const field: AuthField | undefined = FIELD_NAMES[key.toLowerCase()];

        if (!field || !Array.isArray(value)) {
          continue;
        }

        const first = value.find(
          (item): item is string => typeof item === 'string' && item.length > 0,
        );

        if (first) {
          fieldErrors[field] ??= first;
        }
      }
    }
  }

  if (code === 'email_exists') {
    fieldErrors.email ??=
      message ?? 'An account with that email already exists.';
  } else if (code === 'invite_code_invalid') {
    fieldErrors.inviteCode ??= message ?? 'That invite code is not valid.';
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  let formMessage = message;

  if (!formMessage && !hasFieldErrors) {
    if (response.status === 429) {
      formMessage = 'Too many attempts. Try again later.';
    } else if (response.status === 409) {
      fieldErrors.email = 'An account with that email already exists.';
    } else {
      formMessage = fallbackMessage;
    }
  }

  return new AuthApiError({
    status: response.status,
    code,
    message:
      formMessage ??
      Object.values(fieldErrors).find((value) => value.length > 0) ??
      fallbackMessage,
    fieldErrors,
  });
}

async function postAuth(path: string, body: unknown): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}/auth/${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body === undefined ? null : JSON.stringify(body),
    });
  } catch {
    throw new AuthApiError({
      status: 0,
      code: 'network_error',
      message: 'Unable to reach the server. Try again.',
    });
  }
}

async function parseAuthResponse(
  response: Response,
  fallbackMessage: string,
): Promise<AuthResponse> {
  try {
    return AuthResponseSchema.parse(await response.json());
  } catch {
    throw new AuthApiError({
      status: response.status,
      code: 'invalid_response',
      message: fallbackMessage,
    });
  }
}

class AuthClient {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    tokenStore.clear();

    const response = await postAuth('login', credentials);

    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthApiError({
          status: 401,
          code: 'invalid_credentials',
          message: 'Invalid email or password.',
        });
      }

      throw await parseAuthError(response, 'Unable to sign in. Try again.');
    }

    const data = await parseAuthResponse(
      response,
      'We could not finish signing you in. Try again.',
    );
    tokenStore.setSession(data.accessToken, data.expiresAt);
    return data;
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    tokenStore.clear();

    const response = await postAuth('register', request);

    if (!response.ok) {
      throw await parseAuthError(
        response,
        'Unable to create your account. Try again.',
      );
    }

    const data = await parseAuthResponse(
      response,
      'Your account may have been created. Try signing in.',
    );
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
