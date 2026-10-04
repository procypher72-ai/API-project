import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';
import { connectDB } from './config/db.js';

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing database records...');
    await Comment.deleteMany();
    await Post.deleteMany();
    await User.deleteMany();

    console.log('Inserting seed users...');
    const users = await User.create([
      {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'password123',
        role: 'admin',
        bio: 'Tech lead, cloud architect, and open-source enthusiast.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      },
      {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: 'password123',
        role: 'user',
        bio: 'Fullstack developer exploring Node.js, React, and MongoDB.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
      },
      {
        name: 'David Miller',
        email: 'david@example.com',
        password: 'password123',
        role: 'user',
        bio: 'AI researcher and web security advocate.',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
      }
    ]);

    console.log(`Inserted ${users.length} users.`);

    console.log('Inserting seed blog posts...');
    const posts = await Post.create([
      {
        title: 'Mastering Modern Node.js Architecture in 2026',
        category: 'Technology',
        tags: ['nodejs', 'express', 'backend', 'architecture'],
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        content: `Node.js has evolved significantly over the past years. With native ES Modules, built-in watch flags, and robust asynchronous performance, crafting production-ready REST APIs has never been cleaner.
        
In this guide, we explore how to organize controllers, models, and middleware into modular, reusable packages that scale gracefully under high throughput.`,
        excerpt: 'A comprehensive guide to building scalable, maintainable REST APIs with Node.js, Express, and MongoDB.',
        author: users[0]._id,
        likes: [users[1]._id, users[2]._id],
        views: 142
      },
      {
        title: 'Complete Guide to JWT Authentication and Security',
        category: 'Security',
        tags: ['jwt', 'security', 'auth', 'webdev'],
        coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        content: `JSON Web Tokens (JWT) are a compact and self-contained way for securely transmitting information between parties as a JSON object.
        
When designing authentication:
1. Always hash passwords with bcrypt before saving.
2. Sign tokens with a secure secret and reasonable expiry.
3. Verify tokens on protected routes using lightweight middleware.
4. Protect against brute force attacks and improper role escalation.`,
        excerpt: 'Learn how to implement secure token-based authentication with bcrypt and JSON Web Tokens in your backend apps.',
        author: users[1]._id,
        likes: [users[0]._id],
        views: 89
      },
      {
        title: 'Designing High-Performance MongoDB Schemas with Mongoose',
        category: 'Database',
        tags: ['mongodb', 'database', 'nosql', 'mongoose'],
        coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
        content: `Document databases offer tremendous flexibility, but structuring your schemas wisely is key to maintaining high indexing performance and low latency.
        
We cover virtuals, population strategies, compound indexing, pre-save lifecycle hooks, and optimizing relationship models for blog posts, likes, and comment threads.`,
        excerpt: 'Tips and architectural patterns for structuring performant NoSQL data models using Mongoose ODM.',
        author: users[0]._id,
        likes: [users[2]._id],
        views: 215
      }
    ]);

    console.log(`Inserted ${posts.length} blog posts.`);

    console.log('Inserting seed comments...');
    await Comment.create([
      {
        post: posts[0]._id,
        author: users[1]._id,
        content: 'Fantastic breakdown! The separation between controllers and route files makes the codebase very clean.'
      },
      {
        post: posts[0]._id,
        author: users[2]._id,
        content: 'Great tips on native watch mode and ES modules!'
      },
      {
        post: posts[1]._id,
        author: users[0]._id,
        content: 'Spot on about password hashing. Always salt before hashing!'
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
