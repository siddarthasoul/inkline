
import { Types } from 'mongoose';
import ArticleLike from '../models/ArticleLike.js';

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

export class ArticleLikeRepository {
  async countByArticle(articleId: Types.ObjectId): Promise<number> {
    return ArticleLike.countDocuments({ article: articleId }).exec();
  }

  async hasLiked(
    articleId: Types.ObjectId,
    visitor: string,
  ): Promise<boolean> {
    const like = await ArticleLike.exists({
      article: articleId,
      visitor,
    });

    return like !== null;
  }

  /**
   * Returns true only when a new like was inserted.
   * Repeated likes do not increase the count.
   */
  async like(
    articleId: Types.ObjectId,
    visitor: string,
  ): Promise<boolean> {
    try {
      const result = await ArticleLike.updateOne(
        { article: articleId, visitor },
        {
          $setOnInsert: {
            article: articleId,
            visitor,
          },
        },
        { upsert: true },
      ).exec();

      return result.upsertedCount > 0;
    } catch (error) {
      // Another concurrent request may have inserted the same unique like.
      if (isDuplicateKeyError(error)) {
        return false;
      }

      throw error;
    }
  }

  /**
   * Returns true only when an existing like was deleted.
   */
  async unlike(
    articleId: Types.ObjectId,
    visitor: string,
  ): Promise<boolean> {
    const result = await ArticleLike.deleteOne({
      article: articleId,
      visitor,
    }).exec();

    return result.deletedCount > 0;
  }

  async countByArticles(
    articleIds: Types.ObjectId[],
  ): Promise<Map<string, number>> {
    if (articleIds.length === 0) {
      return new Map<string, number>();
    }

    const counts = await ArticleLike.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      { $match: { article: { $in: articleIds } } },
      { $group: { _id: '$article', count: { $sum: 1 } } },
    ]).exec();

    return new Map(
      counts.map(({ _id, count }) => [_id.toString(), count]),
    );
  }
}

export const articleLikeRepository = new ArticleLikeRepository();
