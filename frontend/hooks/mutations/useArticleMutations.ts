import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { apiRequest, jsonBody } from '@/lib/api';
import { articleKeys } from '@/hooks/queries/useArticles';

import type {
  Article,
  CreateArticleInput,
  UpdateArticleInput,
} from '@/types/article';

interface ArticleResult {
  article: Article;
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateArticleInput) =>
      apiRequest<ArticleResult>('/articles', {
        method: 'POST',
        body: jsonBody(input),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: articleKeys.ownerLists(),
      }),
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateArticleInput;
    }) =>
      apiRequest<ArticleResult>(`/articles/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: jsonBody(input),
      }),
    onSuccess: (result) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: articleKeys.ownerLists(),
        }),
        queryClient.invalidateQueries({
          queryKey: articleKeys.ownerDetail(result.article._id),
        }),
        queryClient.invalidateQueries({
          queryKey: articleKeys.publicLists(),
        }),
        queryClient.invalidateQueries({
          queryKey: articleKeys.publicDetail(result.article.slug),
        }),
      ]),
  });
}

export function usePublishArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<ArticleResult>(
        `/articles/${encodeURIComponent(id)}/publish`,
        { method: 'PATCH' },
      ),
    onSuccess: (result) => invalidateArticleQueries(queryClient, result.article),
  });
}

export function useUnpublishArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<ArticleResult>(
        `/articles/${encodeURIComponent(id)}/unpublish`,
        { method: 'PATCH' },
      ),
    onSuccess: (result) => invalidateArticleQueries(queryClient, result.article),
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ id: string; deleted: boolean }>(
        `/articles/${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      ),
    onSuccess: (_result, id) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: articleKeys.ownerLists(),
        }),
        queryClient.removeQueries({
          queryKey: articleKeys.ownerDetail(id),
        }),
        queryClient.invalidateQueries({
          queryKey: articleKeys.publicLists(),
        }),
      ]),
  });
}

function invalidateArticleQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  article: Article,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: articleKeys.ownerLists(),
    }),
    queryClient.invalidateQueries({
      queryKey: articleKeys.ownerDetail(article._id),
    }),
    queryClient.invalidateQueries({
      queryKey: articleKeys.publicLists(),
    }),
    queryClient.invalidateQueries({
      queryKey: articleKeys.publicDetail(article.slug),
    }),
  ]);
}
