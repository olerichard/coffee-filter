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

export const SignupStatusSchema = z.object({
  enabled: z.boolean(),
});
