import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// @desc    Add a comment to a blog post
// @route   POST /api/comments
// @access  Private
export const createComment = async (req, res, next) => {
  try {
    const { postId, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both postId and comment content'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content
    });

    const populatedComment = await comment.populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: populatedComment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a blog post
// @route   GET /api/comments/post/:postId
// @access  Public
export const getCommentsByPost = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: comments.length,
      data: { comments }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment Author, Post Author, or Admin)
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const post = await Post.findById(comment.post);

    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = post && post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment'
      });
    }

    await Comment.findByIdAndDelete(comment._id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
