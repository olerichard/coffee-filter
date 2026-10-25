import type { z } from 'zod';
import type { AuthResponseSchema, UserSchema } from './schemas';

export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  inviteCode: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
