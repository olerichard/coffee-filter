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
