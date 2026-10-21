
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

function logDb(operation: string): void {
  console.info(`[MongoDB] ArticleLike.${operation}`);
}

export class ArticleLikeRepository {
  async countByArticle(articleId: Types.ObjectId): Promise<number> {
    logDb('countByArticle');

    return ArticleLike.countDocuments({ article: articleId }).exec();
  }

  async hasLiked(
    articleId: Types.ObjectId,
    visitor: string,
  ): Promise<boolean> {
    logDb('hasLiked');

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
    logDb('like');

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

      const inserted = result.upsertedCount > 0;

      console.info(
        inserted
          ? '[MongoDB] ArticleLike.like inserted'
          : '[MongoDB] ArticleLike.like already exists',
      );

      return inserted;
    } catch (error) {
      // Concurrent requests can race against the unique compound index.
      if (isDuplicateKeyError(error)) {
        console.info('[MongoDB] ArticleLike.like duplicate prevented');
        return false;
      }

      console.error('[MongoDB ERROR] ArticleLike.like failed');
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
    logDb('unlike');

    const result = await ArticleLike.deleteOne({
      article: articleId,
      visitor,
    }).exec();

    console.info(
      result.deletedCount > 0
        ? '[MongoDB] ArticleLike.unlike deleted'
        : '[MongoDB] ArticleLike.unlike nothing to delete',
    );

    return result.deletedCount > 0;
  }

  async countByArticles(
    articleIds: Types.ObjectId[],
  ): Promise<Map<string, number>> {
    if (articleIds.length === 0) {
      return new Map<string, number>();
    }

    logDb('countByArticles');

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
