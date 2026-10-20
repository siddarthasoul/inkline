import type { Response, CookieOptions } from 'express';

import env from '../config/env.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const sameSiteValue = env.cookie.sameSite.toLowerCase();

if (!['lax', 'strict', 'none'].includes(sameSiteValue)) {
  throw new Error('COOKIE_SAMESITE must be lax, strict, or none');
}

const sameSite = sameSiteValue as NonNullable<CookieOptions['sameSite']>;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.app.env === 'production' || env.cookie.secure || sameSite === 'none',
  sameSite,
  path: '/',
  ...(env.cookie.domain ? { domain: env.cookie.domain } : {}),
};

class CookieUtil {
  setAuthCookies(res: Response, tokens: AuthTokens): void {
    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: env.jwt.accessTokenExpireMinutes * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: env.jwt.refreshTokenExpireDays * 24 * 60 * 60 * 1000,
    });
  }

  setLikeVisitorCookie(res: Response, token: string): void {
    res.cookie('articleVisitor', token, {
      ...cookieOptions,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
  }
}

export default new CookieUtil();
