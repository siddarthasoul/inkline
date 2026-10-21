import { Article, type ArticleStatus } from '../models/Article.js';
import type { Types } from 'mongoose';

export interface CreateArticleInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: ArticleStatus;
  author: Types.ObjectId;
}

export interface UpdateArticleInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: ArticleStatus;
  publishedAt?: Date | null;
}

export interface ListArticlesOptions {
  page?: number;
  limit?: number;
  status?: ArticleStatus;
  author?: Types.ObjectId;
}

function logDb(operation: string): void {
  console.info(`[MongoDB] Article.${operation}`);
}

export class ArticleRepository {
  async create(data: CreateArticleInput) {
    logDb('create');

    return Article.create({
      ...data,
      status: data.status ?? 'draft',
      publishedAt: data.status === 'published' ? new Date() : null,
    });
  }

  async findById(id: string) {
    logDb('findById');
    return Article.findById(id).exec();
  }

  async findBySlug(slug: string) {
    logDb('findBySlug');
    return Article.findOne({
      slug: slug.trim().toLowerCase(),
    }).exec();
  }

  async findPublishedBySlug(slug: string) {
    logDb('findPublishedBySlug');

    return Article.findOne({
      slug: slug.trim().toLowerCase(),
      status: 'published',
    }).exec();
  }

  async listPublished(options: ListArticlesOptions = {}) {
    const page = Math.max(1, Math.floor(options.page ?? 1));
    const limit = Math.min(50, Math.max(1, Math.floor(options.limit ?? 10)));
    const filter = { status: 'published' as const };

    logDb('listPublished.find');
    logDb('listPublished.count');

    const [items, total] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      Article.countDocuments(filter).exec(),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listForOwner(options: ListArticlesOptions = {}) {
    const page = Math.max(1, Math.floor(options.page ?? 1));
    const limit = Math.min(50, Math.max(1, Math.floor(options.limit ?? 10)));

    const filter: {
      status?: ArticleStatus;
      author?: Types.ObjectId;
    } = {};

    if (options.status) filter.status = options.status;
    if (options.author) filter.author = options.author;

    logDb('listForOwner.find');
    logDb('listForOwner.count');

    const [items, total] = await Promise.all([
      Article.find(filter)
        .sort({ updatedAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      Article.countDocuments(filter).exec(),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async incrementPublishedViewBySlug(slug: string) {
    logDb('incrementPublishedViewBySlug');

    return Article.findOneAndUpdate(
      {
        slug: slug.trim().toLowerCase(),
        status: 'published',
      },
      { $inc: { views: 1 } },
      {
        new: true,
        runValidators: true,
      },
    ).exec();
  }

  async updateById(id: string, updates: UpdateArticleInput) {
    logDb('updateById');

    return Article.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    logDb('deleteById');

    const result = await Article.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async existsBySlug(
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    logDb('existsBySlug');

    const filter: Record<string, unknown> = {
      slug: slug.trim().toLowerCase(),
    };

    if (excludeId) filter._id = { $ne: excludeId };

    return (await Article.exists(filter)) !== null;
  }
}

export const articleRepository = new ArticleRepository();