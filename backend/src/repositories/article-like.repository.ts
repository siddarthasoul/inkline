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

  async like(
    articleId: Types.ObjectId,
    visitor: string,
  ): Promise<void> {
    try {
      await ArticleLike.updateOne(
        { article: articleId, visitor },
        {
          $setOnInsert: {
            article: articleId,
            visitor,
          },
        },
        { upsert: true },
      ).exec();
    } catch (error) {
      // Concurrent upserts can race. The unique index makes one insert win.
      // E11000 is safe here: the desired like already exists.
      if (!isDuplicateKeyError(error)) {
        throw error;
      }
    }
  }

  async unlike(
    articleId: Types.ObjectId,
    visitor: string,
  ): Promise<void> {
    await ArticleLike.deleteOne({
      article: articleId,
      visitor,
    }).exec();
  }
}

export const articleLikeRepository = new ArticleLikeRepository();
