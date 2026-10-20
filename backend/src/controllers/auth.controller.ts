import type { RequestHandler } from 'express';
import { userService } from '../services/user.service.js';
import tokenUtil from '../utils/token.js';
import cookieUtil from '../utils/cookies.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function getLoginInput(body: unknown): {
  email: string;
  password: string;
} {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('email' in body) ||
    !('password' in body)
  ) {
    throw new ApiError(400, 'Email and password are required');
  }

  const { email, password } = body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new ApiError(400, 'Email and password must be strings');
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

  if (password.length === 0 || password.length > 128) {
    throw new ApiError(400, 'Password length is invalid');
  }

  return {
    email: normalizedEmail,
    password,
  };
}

class AuthController {
  login: RequestHandler = asyncHandler(async (req, res) => {
    const { email, password } = getLoginInput(req.body);

    const owner = await userService.login(email, password);

    const tokens = {
      accessToken: tokenUtil.createAccessToken(owner.id),
      refreshToken: tokenUtil.createRefreshToken(owner.id),
    };

    cookieUtil.setAuthCookies(res, tokens);

    return ApiResponse.success(
      res,
      { owner },
      'Login successful',
    );
  });

  logout: RequestHandler = (_req, res) => {
    cookieUtil.clearAuthCookies(res);

    return ApiResponse.success(
      res,
      null,
      'Logout successful',
    );
  };

  me: RequestHandler = asyncHandler(async (_req, res) => {
    const ownerId = res.locals.owner?.id;

    if (typeof ownerId !== 'string') {
      throw new ApiError(401, 'Authentication required');
    }

    const owner = await userService.getOwner(ownerId);

    return ApiResponse.success(
      res,
      { owner },
      'Owner profile retrieved',
    );
  });
}

export const authController = new AuthController();
