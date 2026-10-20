import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { articleKeys } from "@/hooks/queries/useArticles";

import type { Article } from "@/types/article";

interface OwnerArticlesResponse {
  articles: {
    items: Article[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface OwnerArticleResponse {
  article: Article;
}

export function useOwnerArticles(
  params: { page?: number; limit?: number; status?: "draft" | "published" } = {},
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (params.status) {
    searchParams.set("status", params.status);
  }

  return useQuery({
    queryKey: articleKeys.ownerList(page, limit, params.status),
    queryFn: async () => {
      const result = await apiRequest<OwnerArticlesResponse>(
        `/articles/owner?${searchParams.toString()}`,
      );

      return result.articles;
    },
  });
}

export function useOwnerArticle(id: string, enabled = true) {
  return useQuery({
    queryKey: articleKeys.ownerDetail(id),
    enabled: enabled && Boolean(id),
    queryFn: async () => {
      const result = await apiRequest<OwnerArticleResponse>(
        `/articles/owner/${encodeURIComponent(id)}`,
      );

      return result.article;
    },
  });
}
