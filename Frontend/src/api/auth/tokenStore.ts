let accessToken: string | null = null;
let expiresAt: number | null = null;

export const tokenStore = {
  getAccessToken(): string | null {
    return accessToken;
  },

  getExpiresAt(): number | null {
    return expiresAt;
  },

  setSession(token: string, expiresAtIso: string): void {
    accessToken = token;
    expiresAt = Date.parse(expiresAtIso);
  },

  clear(): void {
    accessToken = null;
    expiresAt = null;
  },
};
