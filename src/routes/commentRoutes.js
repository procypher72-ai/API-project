import express from 'express';
import {
  createComment,
  getCommentsByPost,
  deleteComment
} from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createComment);
router.get('/post/:postId', getCommentsByPost);
router.delete('/:id', protect, deleteComment);

export default router;
