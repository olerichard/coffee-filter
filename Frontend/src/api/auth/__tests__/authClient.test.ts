import { describe, expect, it } from 'vitest';
import { AuthApiError, parseAuthError } from '../authClient';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('parseAuthError', () => {
  it('maps a duplicate email to the email field', async () => {
    const error = await parseAuthError(
      jsonResponse(
        {
          code: 'email_exists',
          message: 'An account with that email already exists.',
        },
        409,
      ),
      'fallback',
    );

    expect(error).toBeInstanceOf(AuthApiError);
    expect(error.status).toBe(409);
    expect(error.code).toBe('email_exists');
    expect(error.fieldErrors.email).toBe(
      'An account with that email already exists.',
    );
    expect(error.hasFieldErrors).toBe(true);
  });

  it('maps an invalid invite code to the invite code field', async () => {
    const error = await parseAuthError(
      jsonResponse(
        {
          code: 'invite_code_invalid',
          field: 'inviteCode',
          message: 'That invite code is not valid.',
        },
        400,
      ),
      'fallback',
    );

    expect(error.fieldErrors.inviteCode).toBe('That invite code is not valid.');
    expect(error.hasFieldErrors).toBe(true);
  });

  it('maps validation problems to their fields', async () => {
    const error = await parseAuthError(
      jsonResponse(
        {
          errors: {
            Password: ['The password must be at least 12 characters.'],
            Email: ['The Email field is not a valid email address.'],
          },
        },
        400,
      ),
      'fallback',
    );

    expect(error.fieldErrors.password).toBe(
      'The password must be at least 12 characters.',
    );
    expect(error.fieldErrors.email).toBe(
      'The Email field is not a valid email address.',
    );
    expect(error.message).toBe('The password must be at least 12 characters.');
  });

  it('keeps a disabled sign-up as a form level error', async () => {
    const error = await parseAuthError(
      jsonResponse(
        { code: 'signup_disabled', message: 'Sign-up is disabled.' },
        403,
      ),
      'fallback',
    );

    expect(error.code).toBe('signup_disabled');
    expect(error.hasFieldErrors).toBe(false);
    expect(error.message).toBe('Sign-up is disabled.');
  });

  it('falls back to a rate limit message for an empty 429', async () => {
    const error = await parseAuthError(
      new Response(null, { status: 429 }),
      'fallback',
    );

    expect(error.message).toBe('Too many attempts. Try again later.');
    expect(error.hasFieldErrors).toBe(false);
  });

  it('uses the fallback when the body cannot be parsed', async () => {
    const error = await parseAuthError(
      new Response('<html>boom</html>', {
        status: 500,
        headers: { 'content-type': 'text/html' },
      }),
      'fallback',
    );

    expect(error.message).toBe('fallback');
    expect(error.status).toBe(500);
  });
});
