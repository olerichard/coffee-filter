Hi there

## Authentication

Coffee Filter uses short-lived JWT access tokens and rotating refresh tokens:

- Access tokens last 15 minutes and stay in frontend memory only.
- Refresh tokens are opaque, stored in an `HttpOnly`, `SameSite=Strict` cookie, and only a SHA-256 hash is saved in the database.
- Refresh tokens slide for 30 days, with a 90-day absolute session limit.
- Sessions survive page reloads, browser restarts, and deployments. Manage them under **Settings**.
- Changing the password revokes every refresh session. Existing access tokens expire within 15 minutes.
- After upgrading from the previous version, everyone signs in once because old tokens do not contain a session ID.

The production deployment requires `JwtSettings__SecretKey` (at least 32 bytes). See `.env.example` for the available overrides.
