import { articleRepository } from '../repositories/article.repository.js';
import { articleLikeRepository } from '../repositories/article-like.repository.js';
import { ApiError } from '../utils/ApiError.js';

export interface ArticleLikeState {
  count: number;
  liked: boolean;
}

export class ArticleLikeService {
  private async getPublishedArticle(slug: string) {
    const article = await articleRepository.findPublishedBySlug(slug);

    if (!article) {
      throw new ApiError(404, 'Article not found');
    }

    return article;
  }

  async getState(
    slug: string,
    visitor: string,
  ): Promise<ArticleLikeState> {
    const article = await this.getPublishedArticle(slug);

    const [count, liked] = await Promise.all([
      articleLikeRepository.countByArticle(article._id),
      articleLikeRepository.hasLiked(article._id, visitor),
    ]);

    return { count, liked };
  }

  async like(slug: string, visitor: string): Promise<ArticleLikeState> {
    const article = await this.getPublishedArticle(slug);

    await articleLikeRepository.like(article._id, visitor);

    return this.getState(slug, visitor);
  }

  async unlike(slug: string, visitor: string): Promise<ArticleLikeState> {
    const article = await this.getPublishedArticle(slug);

    await articleLikeRepository.unlike(article._id, visitor);

    return this.getState(slug, visitor);
  }
}

export const articleLikeService = new ArticleLikeService();
