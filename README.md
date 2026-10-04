# ⚡ BlogSphere - Node.js Login System & Blog REST API

A production-ready, modular RESTful API backend built with **Node.js**, **Express**, **MongoDB (Mongoose)**, and **JSON Web Tokens (JWT)**. It features a complete authentication & authorization system, blog article lifecycle (CRUD, automatic slugs, search, category/tag filtering, pagination), an interactive liking system, nested comment threads, and a built-in interactive dashboard & API console.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **JWT (JSON Web Tokens)** stateless authentication with configurable expiration.
- **Password Hashing** with `bcryptjs` and automatic salt generation.
- **Protected Routes** with Bearer token authentication middleware.
- **Role-based Access Control** (`user` and `admin` roles).
- **User Profile Management** (view profile, update profile, change password).

### 📝 Blog Management
- **Full CRUD** for blog posts (Create, Read, Update, Delete).
- **Automated Slug Generation** for SEO-friendly URLs (`/api/posts/my-cool-post`).
- **Full-text Search & Filtering** by title, content keyword, category, and tags.
- **Pagination & Sorting** support (`page`, `limit`, `sort`).
- **View Counter** auto-incrementing on article retrieval.
- **Ownership Verification** (only post authors or admins can edit/delete).
- **Draft & Published** post status handling.

### 💬 Engagement & Interactivity
- **Like / Unlike System** with toggle mechanism and unique user checks.
- **Comment Threads** associated with blog articles.
- **Comment Moderation** (comment author, article author, or admin can delete).

### 🖥️ Interactive Web UI & API Console
- Built-in visual dashboard served at `http://localhost:5000`.
- Real-time **Live API Console** to test every endpoint with headers, payloads, and response status codes without needing Postman.
- Quick-fill test demo accounts.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+) with native ES Modules
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **ODM**: [Mongoose](https://mongoosejs.com/)
- **Authentication**: [jsonwebtoken (JWT)](https://github.com/auth0/node-jsonwebtoken)
- **Encryption**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Logging & CORS**: [morgan](https://github.com/expressjs/morgan), [cors](https://github.com/expressjs/cors)

---

## 📂 Project Architecture

```text
API Porject/
├── public/                 # Static interactive dashboard & API console
│   ├── css/
│   │   └── style.css       # Sleek dark-mode aesthetic styling
│   ├── js/
│   │   └── app.js          # Client-side API caller & state manager
│   └── index.html          # Web dashboard interface
├── src/
│   ├── config/
│   │   └── db.js           # Mongoose database connection
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile, password
│   │   ├── postController.js    # Blog CRUD, likes, search, pagination
│   │   └── commentController.js # Comment create, list, delete
│   ├── middlewares/
│   │   ├── authMiddleware.js    # JWT verification & role authorization
│   │   └── errorMiddleware.js   # Centralized error & 404 handler
│   ├── models/
│   │   ├── User.js         # User schema, bcrypt hooks, password compare
│   │   ├── Post.js         # Post schema, auto-slug, virtuals
│   │   └── Comment.js      # Comment schema & relations
│   ├── routes/
│   │   ├── authRoutes.js   # /api/auth endpoints
│   │   ├── postRoutes.js   # /api/posts endpoints
│   │   └── commentRoutes.js# /api/comments endpoints
│   ├── utils/
│   │   ├── generateToken.js# JWT token generator
│   │   └── slugify.js      # URL-friendly slug generator
│   ├── app.js              # Express app configuration & middlewares
│   ├── seed.js             # Database seeder (sample users & articles)
│   └── server.js           # Server bootstrap & port listener
├── .env                    # Environment variables
├── .env.example            # Environment template
├── api.http                # VS Code REST Client queries
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string.

### 2. Configure Environment (`.env`)
The `.env` file is already pre-configured for local development:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/blog_login_db
JWT_SECRET=supersecretjwtkey_change_in_production_123456789!
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Seed the Database
Populate test users and demo blog articles with comments:
```bash
npm run seed
```
This creates:
- **Admin**: `alex@example.com` / `password123`
- **User 1**: `sarah@example.com` / `password123`
- **User 2**: `david@example.com` / `password123`

### 4. Start the Server
For development with auto-reload:
```bash
npm run dev
```

For production:
```bash
npm start
```

### 5. Access the Web Dashboard
Open your browser and navigate to:
```text
http://localhost:5000
```

---

## 📡 API Reference

### 🔐 Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update user profile info (name, bio, avatar) |
| `PUT` | `/api/auth/change-password` | Private | Change user password |

#### Example: Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "bio": "Fullstack developer"
  }'
```

#### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "password123"
  }'
```

---

### 📝 Blog Post Endpoints (`/api/posts`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/posts` | Public | Get published posts (supports `search`, `category`, `tag`, `page`, `limit`) |
| `GET` | `/api/posts/:idOrSlug` | Public | Get single post by Mongo ID or Slug (increments views) |
| `POST` | `/api/posts` | Private | Create a new blog post |
| `PUT` | `/api/posts/:id` | Private (Author/Admin) | Update an existing post |
| `DELETE`| `/api/posts/:id` | Private (Author/Admin) | Delete a post and its comments |
| `POST` | `/api/posts/:id/like` | Private | Toggle like / unlike on post |
| `GET` | `/api/posts/user/me` | Private | Get posts written by current user |

#### Example: Query Posts with Filters
```text
GET /api/posts?page=1&limit=5&category=Technology&search=Node
```

#### Example: Create Post
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "title": "Scaling Node.js Backends in 2026",
    "category": "Technology",
    "tags": ["nodejs", "express", "backend"],
    "content": "Full article markdown or body text goes here..."
  }'
```

---

### 💬 Comment Endpoints (`/api/comments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/comments` | Private | Add comment (`postId`, `content`) |
| `GET` | `/api/comments/post/:postId` | Public | List comments for an article |
| `DELETE`| `/api/comments/:id` | Private (Author/Admin) | Delete a comment |

---

## 🧪 Testing with VS Code REST Client
If you have the **REST Client** extension in VS Code, open [`api.http`](file:///c:/Users/DREAMWORLD/Desktop/API%20Porject/api.http) and click **Send Request** directly above each endpoint.
