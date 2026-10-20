
import type { RequestHandler } from 'express';

import { articleService } from '../services/article.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { articleLikeService } from '../services/article-like.service.js';

function getOwnerId(res: Parameters<RequestHandler>[1]): string {
  const ownerId = res.locals.owner?.id;

  if (typeof ownerId !== 'string') {
    throw new ApiError(401, 'Authentication required');
  }

  return ownerId;
}

function getRouteParam(value: string | string[] | undefined, name: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, `Invalid ${name}`);
  }

  return value;
}

function getArticleInput(body: unknown): {
  title: string;
  content: string;
  excerpt?: string;
} {
  if (typeof body !== 'object' || body === null) {
    throw new ApiError(400, 'Request body must be an object');
  }

  const input = body as Record<string, unknown>;
  const { title, content, excerpt } = input;

  if (typeof title !== 'string' || typeof content !== 'string') {
    throw new ApiError(400, 'Title and content must be strings');
  }

  if (excerpt !== undefined && typeof excerpt !== 'string') {
    throw new ApiError(400, 'Excerpt must be a string');
  }

  return {
    title,
    content,
    ...(excerpt !== undefined ? { excerpt } : {}),
  };
}

function getPagination(query: {
  page?: unknown;
  limit?: unknown;
}): { page: number; limit: number } {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new ApiError(
      400,
      'Page must be positive and limit must be between 1 and 100',
    );
  }

  return { page, limit };
}

class ArticleController {
  create: RequestHandler = asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(res);
    const input = getArticleInput(req.body);

    // Creation defaults to draft. Publishing is a separate owner action.
    const article = await articleService.create(ownerId, {
      ...input,
      status: 'draft',
    });

    return ApiResponse.created(
      res,
      { article },
      'Article draft created successfully',
    );
  });


  private getLikeVisitor(res: Parameters<RequestHandler>[1]): string {
    const visitor = res.locals.likeVisitor;

    if (typeof visitor !== 'string' || !visitor) {
      throw new ApiError(500, 'Visitor identity unavailable');
    }

    return visitor;
  }

  getLikes: RequestHandler = asyncHandler(async (req, res) => {
    const slug = getRouteParam(req.params.slug, 'slug');
    const visitor = this.getLikeVisitor(res);

    const state = await articleLikeService.getState(slug, visitor);

    return ApiResponse.success(
      res,
      { likes: state },
      'Article likes retrieved',
    );
  });

  like: RequestHandler = asyncHandler(async (req, res) => {
    const slug = getRouteParam(req.params.slug, 'slug');
    const visitor = this.getLikeVisitor(res);

    const state = await articleLikeService.like(slug, visitor);

    return ApiResponse.success(
      res,
      { likes: state },
      'Article liked successfully',
    );
  });

  unlike: RequestHandler = asyncHandler(async (req, res) => {
    const slug = getRouteParam(req.params.slug, 'slug');
    const visitor = this.getLikeVisitor(res);

    const state = await articleLikeService.unlike(slug, visitor);

    return ApiResponse.success(
      res,
      { likes: state },
      'Article unliked successfully',
    );
  });


  getPublishedArticles: RequestHandler = asyncHandler(async (req, res) => {
    const pagination = getPagination(req.query);
    const articles = await articleService.getPublishedArticles(
      pagination.page,
      pagination.limit,
    );

    return ApiResponse.success(
      res,
      { articles },
      'Published articles retrieved',
    );
  });

  getPublishedArticle: RequestHandler = asyncHandler(async (req, res) => {
    const slug = getRouteParam(req.params.slug, 'slug');

    const article = await articleService.getPublishedArticle(slug);

    return ApiResponse.success(
      res,
      { article },
      'Article retrieved successfully',
    );
  });

  getOwnerArticles: RequestHandler = asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(res);
    const { page, limit } = getPagination(req.query);

    const status = req.query.status;

    if (
      status !== undefined &&
      status !== 'draft' &&
      status !== 'published'
    ) {
      throw new ApiError(400, 'Status must be draft or published');
    }

    const articles = await articleService.getOwnerArticles(
      ownerId,
      page,
      limit,
      status,
    );

    return ApiResponse.success(
      res,
      { articles },
      'Owner articles retrieved',
    );
  });

  getOwnerArticle: RequestHandler = asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(res);
    const articleId = getRouteParam(req.params.id, 'article ID');

    const article = await articleService.getOwnerArticle(
      ownerId,
      articleId,
    );

    return ApiResponse.success(
      res,
      { article },
      'Owner article retrieved',
    );
  });

  update: RequestHandler = asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(res);
    const articleId = getRouteParam(req.params.id, 'article ID');

    if (typeof req.body !== 'object' || req.body === null) {
      throw new ApiError(400, 'Request body must be an object');
    }

    const input = req.body as Record<string, unknown>;
    const updates: {
      title?: string;
      content?: string;
      excerpt?: string;
    } = {};

    for (const key of ['title', 'content', 'excerpt'] as const) {
      if (input[key] !== undefined) {
        if (typeof input[key] !== 'string') {
          throw new ApiError(400, `${key} must be a string`);
        }

        updates[key] = input[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'Provide at least one field to update');
    }

    const article = await articleService.update(
      ownerId,
      articleId,
      updates,
    );

    return ApiResponse.success(
      res,
      { article },
      'Article updated successfully',
    );
  });

  publish: RequestHandler = asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(res);
    const articleId = getRouteParam(req.params.id, 'article ID');

    const article = await articleService.publish(ownerId, articleId);

    return ApiResponse.success(
      res,
      { article },
      'Article published successfully',
    );
  });

  unpublish: RequestHandler = asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(res);
    const articleId = getRouteParam(req.params.id, 'article ID');

    const article = await articleService.unpublish(ownerId, articleId);

    return ApiResponse.success(
      res,
      { article },
      'Article moved to draft',
    );
  });

  delete: RequestHandler = asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(res);
    const articleId = getRouteParam(req.params.id, 'article ID');

    const result = await articleService.delete(ownerId, articleId);

    return ApiResponse.success(
      res,
      result,
      'Article deleted successfully',
    );
  });
}

export const articleController = new ArticleController();
