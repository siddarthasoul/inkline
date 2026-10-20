import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

interface ArticleLikesState {
  count: number;
  liked: boolean;
}

interface ArticleLikesResult {
  likes: ArticleLikesState;
}

export const articleLikeKeys = {
  detail: (slug: string) => ['article-likes', slug] as const,
};

export function useArticleLikes(slug: string) {
  const queryClient = useQueryClient();
  const queryKey = articleLikeKeys.detail(slug);

  const likesQuery = useQuery({
    queryKey,
    queryFn: () =>
      apiRequest<ArticleLikesResult>(
        `/articles/${encodeURIComponent(slug)}/likes`,
      ).then((result) => result.likes),
    enabled: slug.length > 0,
  });

  const likeMutation = useMutation({
    mutationFn: (liked: boolean) =>
      apiRequest<ArticleLikesResult>(
        `/articles/${encodeURIComponent(slug)}/likes`,
        { method: liked ? 'DELETE' : 'PUT' },
      ).then((result) => result.likes),
    onSuccess: (likes) => {
      queryClient.setQueryData(queryKey, likes);
    },
  });

  return {
    likesQuery,
    likeMutation,
  };
}
