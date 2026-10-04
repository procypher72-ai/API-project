import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Please provide content for the blog post']
    },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters']
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'
    },
    category: {
      type: String,
      trim: true,
      default: 'Technology'
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A blog post must have an author']
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    },
    views: {
      type: Number,
      default: 0
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for comments count or comments
postSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Auto-generate slug and excerpt before saving if not present
postSchema.pre('save', async function () {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = slugify(this.title);
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Check for collisions
    const PostModel = mongoose.model('Post');
    while (await PostModel.exists({ slug: uniqueSlug, _id: { $ne: this._id } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = uniqueSlug;
  }

  if (!this.excerpt && this.content) {
    // Strip simple HTML/markdown if any and cut to 160 chars
    const plainText = this.content.replace(/<[^>]+>/g, '').trim();
    this.excerpt = plainText.length > 160 ? plainText.substring(0, 160) + '...' : plainText;
  }
});

const Post = mongoose.model('Post', postSchema);
export default Post;
