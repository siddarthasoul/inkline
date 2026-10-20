import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { apiRequest, jsonBody } from '@/lib/api';
import { authKeys } from '@/hooks/queries/useAuth';

import type { AuthResult, LoginInput } from '@/types/auth';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiRequest<AuthResult>('/auth/login', {
        method: 'POST',
        body: jsonBody(input),
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(authKeys.me, result.owner);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<null>('/auth/logout', {
        method: 'POST',
      }),
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
    },
  });
}
