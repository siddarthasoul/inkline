
import { Router } from 'express';

import { articleController } from '../controllers/article.controller.js';
import { requireOwner } from '../middleware/auth.middleware.js';
import { ensureLikeVisitor } from '../middleware/like-visitor.middleware.js';

const articleRouter = Router();

// Public: list published articles
articleRouter.get('/', articleController.getPublishedArticles);

// Owner routes must come before the public /:slug route
articleRouter.get('/owner', requireOwner, articleController.getOwnerArticles);
articleRouter.get('/owner/:id', requireOwner, articleController.getOwnerArticle);

// Public: read a published article by slug
articleRouter.get('/:slug', articleController.getPublishedArticle);

// Owner: create, edit, publish, unpublish, delete
articleRouter.post('/', requireOwner, articleController.create);
articleRouter.patch('/:id/publish', requireOwner, articleController.publish);
articleRouter.patch('/:id/unpublish', requireOwner, articleController.unpublish);
articleRouter.patch('/:id', requireOwner, articleController.update);
articleRouter.delete('/:id', requireOwner, articleController.delete);


 // Public: anonymous article likes
articleRouter.get(
  '/:slug/likes',
  ensureLikeVisitor,
  articleController.getLikes,
);

articleRouter.put(
  '/:slug/likes',
  ensureLikeVisitor,
  articleController.like,
);

articleRouter.delete(
  '/:slug/likes',
  ensureLikeVisitor,
  articleController.unlike,
);


export default articleRouter;
