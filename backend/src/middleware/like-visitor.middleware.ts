import { createHash, randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';

import cookieUtil from '../utils/cookies.js';

const VISITOR_COOKIE_PATTERN = /^[a-f0-9]{64}$/;

export const ensureLikeVisitor: RequestHandler = (req, res, next) => {
  const existingToken: unknown = req.cookies?.articleVisitor;

  const token =
    typeof existingToken === 'string' &&
    VISITOR_COOKIE_PATTERN.test(existingToken)
      ? existingToken
      : randomBytes(32).toString('hex');

  if (token !== existingToken) {
    cookieUtil.setLikeVisitorCookie(res, token);
  }

  res.locals.likeVisitor = createHash('sha256')
    .update(token)
    .digest('hex');

  next();
};
