import type { RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError.js';
import tokenUtil from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireOwner: RequestHandler = asyncHandler(
  (req, res, next) => {
    const token = tokenUtil.getAccessToken(req);

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const payload = tokenUtil.verifyAccessToken(token);

    res.locals.owner = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  },
);
