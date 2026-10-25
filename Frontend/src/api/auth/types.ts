import type { z } from 'zod';
import type { AuthResponseSchema, SessionSchema, UserSchema } from './schemas';

export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type Session = z.infer<typeof SessionSchema>;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
