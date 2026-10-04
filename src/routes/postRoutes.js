import express from 'express';
import {
  createPost,
  getPosts,
  getPostByIdOrSlug,
  updatePost,
  deletePost,
  toggleLikePost,
  getMyPosts
} from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.get('/user/me', protect, getMyPosts);

router.route('/:idOrSlug')
  .get(getPostByIdOrSlug);

router.route('/:id')
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLikePost);

export default router;
