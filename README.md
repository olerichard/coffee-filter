Hi there

## Authentication

Coffee Filter uses short-lived JWT access tokens and rotating refresh tokens:

- Users sign in with email and password.
- Access tokens last 15 minutes and stay in frontend memory only.
- Refresh tokens are opaque, stored in an `HttpOnly`, `SameSite=Strict` cookie, and only a SHA-256 hash is saved in the database.
- Refresh tokens rotate on use and expire after 30 days of inactivity.
- Sessions survive page reloads, browser restarts, and deployments.
- Changing the password or signing out everywhere revokes every refresh token. Existing access tokens expire within 15 minutes.
- After upgrading from the previous version, everyone signs in once because old tokens do not contain a session ID.

## Sign-up

New accounts are invite-only. Set `Signup__InviteCode` in the environment to
enable the registration form; leaving it empty disables sign-ups. Users enter
their display name, email, password, and the invite code. Email is the unique
login identifier, and display names do not have to be unique.

The production deployment requires `JwtSettings__SecretKey` (at least 32 bytes). See `.env.example` for the available overrides.

## Password reset

Users can request a reset link from `/forgot-password`. The API always answers
the same way, whether or not the email belongs to an account, so the form
cannot be used to discover who has signed up.

- The link points at `/reset-password?token=...` and expires after 30 minutes
  (`PasswordReset__TokenMinutes`).
- Only a SHA-256 hash of the token is stored, and only the newest link for a
  user stays valid. Using a link deletes it, so it cannot be replayed.
- A successful reset signs the user out everywhere; no session is created, so
  they continue on the sign-in page.
- Reset requests and submissions are rate limited per IP address.

Links are built from `PasswordReset__FrontendBaseUrl`, which must be an absolute
`http(s)` URL. Email goes out through SMTP:

```
Email__Smtp__Host=send.one.com
Email__Smtp__Port=587
Email__Smtp__Security=starttls
Email__Smtp__Username=no-reply@olerichard.no
Email__Smtp__Password=...
Email__Smtp__FromAddress=no-reply@olerichard.no
```

Any relay works (for Resend: `smtp.resend.com`, username `resend`, and an API
key as the password). In Development, leaving `Email__Smtp__Host` empty prints
the reset link to the API log instead of sending mail. Outside Development the
API refuses to start without an SMTP host, since reset emails could not be
delivered. Messages are queued in memory and sent in the background, so a slow
or failing mail server never delays the request.
