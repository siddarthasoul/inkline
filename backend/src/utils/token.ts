import type { Request } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import env from '../config/env.js';
import { ApiError } from './ApiError.js';

type OwnerTokenPayload = {
  sub: string;
  role: 'owner';
  type: 'access' | 'refresh';
};

class TokenUtil {
  private readonly algorithm = 'HS256' as const;

  getAccessToken(req: Request): string | null {
    const cookieToken = req.cookies?.accessToken;

    if (typeof cookieToken === 'string' && cookieToken) {
      return cookieToken;
    }

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice('Bearer '.length).trim() || null;
    }

    return null;
  }

  getRefreshToken(req: Request): string | null {
    const cookieToken = req.cookies?.refreshToken;

    return typeof cookieToken === 'string' && cookieToken
      ? cookieToken
      : null;
  }

  createAccessToken(ownerId: string): string {
    return jwt.sign(
      {
        role: 'owner',
        type: 'access',
      },
      env.jwt.secret,
      {
        subject: ownerId,
        algorithm: this.algorithm,
        expiresIn: env.jwt.accessTokenExpireMinutes * 60,
      },
    );
  }

  createRefreshToken(ownerId: string): string {
    return jwt.sign(
      {
        role: 'owner',
        type: 'refresh',
      },
      env.jwt.secret,
      {
        subject: ownerId,
        algorithm: this.algorithm,
        expiresIn: env.jwt.refreshTokenExpireDays * 24 * 60 * 60,
      },
    );
  }

  verifyAccessToken(token: string): OwnerTokenPayload {
    return this.verifyToken(token, 'access');
  }

  verifyRefreshToken(token: string): OwnerTokenPayload {
    return this.verifyToken(token, 'refresh');
  }

  private verifyToken(
    token: string,
    expectedType: 'access' | 'refresh',
  ): OwnerTokenPayload {
    let payload: string | JwtPayload;

    try {
      payload = jwt.verify(token, env.jwt.secret, {
        algorithms: [this.algorithm],
      });
    } catch {
      throw new ApiError(401, 'Invalid or expired authentication token');
    }

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      !/^[a-f\d]{24}$/i.test(payload.sub) ||
      payload.role !== 'owner' ||
      payload.type !== expectedType
    ) {
      throw new ApiError(401, 'Invalid authentication token');
    }

    return {
      sub: payload.sub,
      role: 'owner',
      type: expectedType,
    };
  }
}

export default new TokenUtil();
