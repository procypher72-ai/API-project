import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints: http://localhost:${PORT}/api/health`);
    console.log(`🖥️  Live Interactive UI: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
