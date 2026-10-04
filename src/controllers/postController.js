import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// @desc    Create a new blog post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content'
      });
    }

    const post = await Post.create({
      title,
      content,
      excerpt,
      coverImage: coverImage || undefined,
      category: category || 'Technology',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
      status: status || 'published',
      author: req.user._id
    });

    const populatedPost = await post.populate('author', 'name email avatar bio');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: populatedPost }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blog posts with search, filter & pagination
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      tag,
      author,
      sort = '-createdAt'
    } = req.query;

    const query = { status: 'published' };

    // Search keyword in title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [new RegExp(`^${tag}$`, 'i')] };
    }

    // Filter by author ID
    if (author) {
      query.author = author;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name email avatar bio')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: posts.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog post by ID or Slug
// @route   GET /api/posts/:idOrSlug
// @access  Public
export const getPostByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    // Check if valid ObjectId or treat as slug
    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const post = await Post.findOne(query).populate('author', 'name email avatar bio');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count
    post.views += 1;
    await post.save({ validateBeforeSave: false });

    // Fetch comments for this post
    const comments = await Comment.find({ post: post._id })
      .populate('author', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: {
        post,
        comments
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a blog post
// @route   PUT /api/posts/:id
// @access  Private (Author or Admin)
export const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check authorization: must be author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this post'
      });
    }

    const { title, content, excerpt, coverImage, category, tags, status } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (coverImage) post.coverImage = coverImage;
    if (category) post.category = category;
    if (tags !== undefined) {
      post.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : post.tags;
    }
    if (status) post.status = status;

    await post.save();

    const updatedPost = await Post.findById(post._id).populate('author', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post: updatedPost }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/posts/:id
// @access  Private (Author or Admin)
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check authorization
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }

    // Remove post
    await Post.findByIdAndDelete(post._id);

    // Remove all comments for this post
    await Comment.deleteMany({ post: post._id });

    res.status(200).json({
      success: true,
      message: 'Post and associated comments deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Unlike a blog post
// @route   POST /api/posts/:id/like
// @access  Private
export const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const userIdStr = req.user._id.toString();
    const hasLiked = post.likes.some((id) => id.toString() === userIdStr);

    if (hasLiked) {
      // Remove like
      post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      // Add like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: hasLiked ? 'Post unliked' : 'Post liked',
      data: {
        likesCount: post.likes.length,
        isLiked: !hasLiked
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts written by current logged in user
// @route   GET /api/posts/user/me
// @access  Private
export const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: posts.length,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};
