import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';
import type { Article, ArticleList } from '@/types/article';

export const articleKeys = {
  all: ['articles'] as const,
  publicLists: () => [...articleKeys.all, 'public'] as const,
  publicList: (page: number, limit: number) =>
    [...articleKeys.publicLists(), page, limit] as const,
  publicDetail: (slug: string) =>
    [...articleKeys.all, 'public-detail', slug] as const,
  ownerLists: () => [...articleKeys.all, 'owner'] as const,
  ownerList: (page: number, limit: number, status?: string) =>
    [...articleKeys.ownerLists(), page, limit, status ?? 'all'] as const,
  ownerDetail: (id: string) =>
    [...articleKeys.all, 'owner-detail', id] as const,
};

interface ArticleDetailResult {
  article: Article;
}

export function usePublishedArticles(page = 1, limit = 10) {
  return useQuery({
    queryKey: articleKeys.publicList(page, limit),
    queryFn: () =>
      apiRequest<{ articles: ArticleList }>(
        `/articles?page=${page}&limit=${limit}`,
      ).then((result) => result.articles),
  });
}

export function usePublishedArticle(slug: string) {
  return useQuery({
    queryKey: articleKeys.publicDetail(slug),
    queryFn: () =>
      apiRequest<ArticleDetailResult>(
        `/articles/${encodeURIComponent(slug)}`,
      ).then((result) => result.article),
    enabled: slug.length > 0,
  });
}
