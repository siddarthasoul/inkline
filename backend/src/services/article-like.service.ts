
import { articleRepository } from '../repositories/article.repository.js';
import { articleLikeRepository } from '../repositories/article-like.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { cacheService, CacheTTL } from './cache.service.js';

export interface ArticleLikeState {
  count: number;
  liked: boolean;
}

export class ArticleLikeService {
  private async getPublishedArticle(slug: string) {
    const key = `article:likes:article:${slug}`;

    const article = await cacheService.remember(
      key,
      CacheTTL.article,
      () => articleRepository.findPublishedBySlug(slug),
    );

    if (!article) {
      throw new ApiError(404, 'Article not found');
    }

    return article;
  }

  private stateCacheKey(articleId: string, visitor: string): string {
    return `article:likes:state:${articleId}:${visitor}`;
  }

  private countCacheKey(articleId: string): string {
    return `article:likes:count:${articleId}`;
  }

  async getState(
    slug: string,
    visitor: string,
  ): Promise<ArticleLikeState> {
    const article = await this.getPublishedArticle(slug);
    const articleId = article._id.toString();
    const stateKey = this.stateCacheKey(articleId, visitor);
    const countKey = this.countCacheKey(articleId);

    const [cachedLiked, count] = await Promise.all([
      cacheService.get<boolean>(stateKey),
      cacheService.remember(
        countKey,
        CacheTTL.short,
        () => articleLikeRepository.countByArticle(article._id),
      ),
    ]);

    const liked =
      cachedLiked !== null
        ? cachedLiked
        : await articleLikeRepository.hasLiked(article._id, visitor);

    if (cachedLiked === null) {
      await cacheService.set(stateKey, liked, CacheTTL.short);
    }

    return { count, liked };
  }

  async like(
    slug: string,
    visitor: string,
  ): Promise<ArticleLikeState> {
    const article = await this.getPublishedArticle(slug);
    const articleId = article._id.toString();

    // MongoDB decides whether this is a genuinely new like.
    await articleLikeRepository.like(article._id, visitor);

    return this.refreshAfterMutation(articleId, slug, visitor, true);
  }

  async unlike(
    slug: string,
    visitor: string,
  ): Promise<ArticleLikeState> {
    const article = await this.getPublishedArticle(slug);
    const articleId = article._id.toString();

    // MongoDB decides whether an existing like was actually removed.
    await articleLikeRepository.unlike(article._id, visitor);

    return this.refreshAfterMutation(articleId, slug, visitor, false);
  }

  private async refreshAfterMutation(
    articleId: string,
    slug: string,
    visitor: string,
    liked: boolean,
  ): Promise<ArticleLikeState> {
    const stateKey = this.stateCacheKey(articleId, visitor);
    const countKey = this.countCacheKey(articleId);

    // Invalidate the shared count instead of blindly incrementing/decrementing
    // a potentially missing or stale Redis counter.
    await Promise.all([
      cacheService.invalidate(countKey),
      cacheService.set(stateKey, liked, CacheTTL.short),
      cacheService.invalidatePattern('articles:owner:list:*'),
    ]);

    // Reload the authoritative count once after the mutation, then cache it.
    const count = await cacheService.remember(
      countKey,
      CacheTTL.short,
      async () => articleLikeRepository.countByArticle(
        (await this.getPublishedArticle(slug))._id,
      ),
    );

    return { count, liked };
  }
}

export const articleLikeService = new ArticleLikeService();
