import { useQuery } from '@tanstack/react-query';
import { authClient } from './authClient';

export const SIGNUP_STATUS_QUERY_KEY = ['auth', 'signup-status'] as const;

export function useSignupStatus() {
  return useQuery({
    queryKey: SIGNUP_STATUS_QUERY_KEY,
    queryFn: authClient.signupStatus,
    staleTime: Infinity,
    retry: false,
  });
}
