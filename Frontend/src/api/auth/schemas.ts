import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  displayName: z.string().nullish(),
  isActive: z.boolean().optional(),
  lastLoginAt: z.iso.datetime({ offset: true }).nullish(),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  expiresAt: z.iso.datetime({ offset: true }),
  user: UserSchema,
});

export const SessionSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  lastUsedAt: z.iso.datetime({ offset: true }),
  expiresAt: z.iso.datetime({ offset: true }),
  ipAddress: z.string().nullish(),
  userAgent: z.string().nullish(),
  isCurrent: z.boolean(),
});
