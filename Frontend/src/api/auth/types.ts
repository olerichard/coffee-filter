import type { z } from 'zod';
import type { AuthResponseSchema, UserSchema } from './schemas';

export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
