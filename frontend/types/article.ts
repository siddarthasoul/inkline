import type { PaginatedResult } from './api';

export type ArticleStatus = 'draft' | 'published';

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: ArticleStatus;
  author: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  excerpt?: string;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  excerpt?: string;
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  status?: ArticleStatus;
}

export type ArticleList = PaginatedResult<Article>;
