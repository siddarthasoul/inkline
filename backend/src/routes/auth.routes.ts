import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller.js';
import { requireOwner } from '../middleware/auth.middleware.js';

const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
});

authRouter.post('/login', loginLimiter, authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireOwner, authController.me);

export default authRouter;
