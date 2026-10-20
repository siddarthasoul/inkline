import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';
import type { Owner } from '@/types/auth';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

interface OwnerResult {
  owner: Owner;
}

export function useCurrentOwner(enabled = true) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () =>
      apiRequest<OwnerResult>('/auth/me').then((result) => result.owner),
    enabled,
    retry: false,
  });
}
