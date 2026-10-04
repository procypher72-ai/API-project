import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve static frontend files (Interactive Dashboard & API Tester)
app.use(express.static(path.join(__dirname, '../public')));

// API Health Check & Info
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Blog & Login API is up and running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      comments: '/api/comments'
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Catch 404 & Centralized Error Handler
app.use(notFound);
app.use(errorHandler);

export default app;
