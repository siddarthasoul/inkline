
import { Types } from 'mongoose';
import {
  articleRepository,
  type UpdateArticleInput,
} from '../repositories/article.repository.js';
import type { ArticleStatus } from '../models/Article.js';
import { ApiError } from '../utils/ApiError.js';
import { articleLikeRepository } from '../repositories/article-like.repository.js';
import { cacheService, CacheTTL } from './cache.service.js';

function createSlug(title: string): string {
  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200)
    .replace(/-+$/g, '');

  if (!slug) {
    throw new ApiError(400, 'Please provide a valid article title');
  }

  return slug;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

export class ArticleService {
  private async invalidateArticleCaches(...slugs: string[]): Promise<void> {
    const uniqueSlugs = [...new Set(slugs.filter(Boolean))];

    await Promise.all([
      cacheService.invalidatePattern('articles:published:list:*'),
      cacheService.invalidatePattern('articles:owner:list:*'),
      ...uniqueSlugs.flatMap((slug) => [
        cacheService.invalidate(`article:published:slug:${slug}`),
        // ArticleLikeService also caches the published article lookup.
        cacheService.invalidate(`article:likes:article:${slug}`),
      ]),
    ]);
  }

  async create(
    ownerId: string,
    input: {
      title: string;
      content: string;
      excerpt?: string;
      status?: ArticleStatus;
    },
  ) {
    this.checkOwnerId(ownerId);
    this.validateContent(input.title, input.content);

    const title = input.title.trim();
    const slug = createSlug(title);
    const status = input.status ?? 'draft';

    if (!['draft', 'published'].includes(status)) {
      throw new ApiError(400, 'Invalid article status');
    }

    if (await articleRepository.existsBySlug(slug)) {
      throw new ApiError(409, 'An article with this title already exists');
    }

    const articleData = {
      title,
      slug,
      content: input.content.trim(),
      status,
      author: new Types.ObjectId(ownerId),
      ...(input.excerpt !== undefined
        ? { excerpt: input.excerpt.trim() }
        : {}),
    };

    try {
      const article = await articleRepository.create(articleData);
      await this.invalidateArticleCaches(slug);
      return article;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(409, 'Article slug already exists');
      }
      throw error;
    }
  }

  async getPublishedArticles(page = 1, limit = 10) {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));

    const key =
      `articles:published:list:page:${safePage}:limit:${safeLimit}`;

    return cacheService.remember(
      key,
      CacheTTL.list,
      () =>
        articleRepository.listPublished({
          page: safePage,
          limit: safeLimit,
        }),
    );
  }

  /**
   * View counting is intentionally left unchanged here.
   * This method currently increments MongoDB on every request.
   * Visitor-based 24-hour deduplication will be wired separately.
   */
  async getPublishedArticle(slug: string) {
    const article =
      await articleRepository.incrementPublishedViewBySlug(slug);

    if (!article) {
      throw new ApiError(404, 'Article not found');
    }

    return article;
  }

  async getOwnerArticles(
    ownerId: string,
    page = 1,
    limit = 10,
    status?: ArticleStatus,
  ) {
    this.checkOwnerId(ownerId);

    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));
    const statusKey = status ?? 'all';

    const key =
      `articles:owner:list:${ownerId}:page:${safePage}:limit:${safeLimit}:status:${statusKey}`;

    return cacheService.remember(key, CacheTTL.short, async () => {
      const result = await articleRepository.listForOwner({
        page: safePage,
        limit: safeLimit,
        author: new Types.ObjectId(ownerId),
        ...(status !== undefined ? { status } : {}),
      });

      const likeCounts = await articleLikeRepository.countByArticles(
        result.items.map((article) => article._id),
      );

      return {
        ...result,
        items: result.items.map((article) => ({
          ...article,
          views: article.views ?? 0,
          likes: likeCounts.get(article._id.toString()) ?? 0,
        })),
      };
    });
  }

  async getOwnerArticle(ownerId: string, articleId: string) {
    this.checkOwnerId(ownerId);
    this.checkArticleId(articleId);

    const article = await articleRepository.findById(articleId);

    if (!article || article.author.toString() !== ownerId) {
      throw new ApiError(404, 'Article not found');
    }

    return article;
  }

  async update(
    ownerId: string,
    articleId: string,
    input: {
      title?: string;
      content?: string;
      excerpt?: string;
    },
  ) {
    const article = await this.getOwnerArticle(ownerId, articleId);

    const title = input.title?.trim() ?? article.title;
    const content = input.content?.trim() ?? article.content;

    this.validateContent(title, content);

    const updates: UpdateArticleInput = { title, content };

    if (input.excerpt !== undefined) {
      updates.excerpt = input.excerpt.trim();
    }

    if (input.title !== undefined) {
      updates.slug = createSlug(title);
    }

    if (
      updates.slug &&
      updates.slug !== article.slug &&
      await articleRepository.existsBySlug(updates.slug, articleId)
    ) {
      throw new ApiError(409, 'Article slug already exists');
    }

    try {
      const updated = await articleRepository.updateById(articleId, updates);

      if (!updated) {
        throw new ApiError(404, 'Article not found');
      }

      await this.invalidateArticleCaches(article.slug, updated.slug);
      return updated;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(409, 'Article slug already exists');
      }
      throw error;
    }
  }

  async publish(ownerId: string, articleId: string) {
    return this.changeStatus(ownerId, articleId, 'published');
  }

  async unpublish(ownerId: string, articleId: string) {
    return this.changeStatus(ownerId, articleId, 'draft');
  }

  async delete(ownerId: string, articleId: string) {
    const article = await this.getOwnerArticle(ownerId, articleId);
    const deleted = await articleRepository.deleteById(articleId);

    if (!deleted) {
      throw new ApiError(404, 'Article not found');
    }

    await this.invalidateArticleCaches(article.slug);
    return { id: articleId, deleted: true };
  }

  private async changeStatus(
    ownerId: string,
    articleId: string,
    status: ArticleStatus,
  ) {
    const existing = await this.getOwnerArticle(ownerId, articleId);

    const article = await articleRepository.updateById(articleId, {
      status,
      publishedAt: status === 'published' ? new Date() : null,
    });

    if (!article) {
      throw new ApiError(404, 'Article not found');
    }

    await this.invalidateArticleCaches(existing.slug, article.slug);
    return article;
  }

  private checkOwnerId(ownerId: string) {
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new ApiError(401, 'Invalid owner session');
    }
  }

  private checkArticleId(articleId: string) {
    if (!Types.ObjectId.isValid(articleId)) {
      throw new ApiError(400, 'Invalid article ID');
    }
  }

  private validateContent(title: string, content: string) {
    if (!title?.trim()) {
      throw new ApiError(400, 'Article title is required');
    }

    if (title.trim().length > 180) {
      throw new ApiError(400, 'Title cannot exceed 180 characters');
    }

    if (!content?.trim()) {
      throw new ApiError(400, 'Article content is required');
    }
  }
}

export const articleService = new ArticleService();
