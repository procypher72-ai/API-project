// BlogSphere Client App
let state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  currentCategory: '',
  searchQuery: '',
  page: 1,
  currentPost: null
};

// DOM Elements
const authSection = document.getElementById('authSection');
const authModal = document.getElementById('authModal');
const postModal = document.getElementById('postModal');
const postsGrid = document.getElementById('postsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilters = document.getElementById('categoryFilters');
const toastEl = document.getElementById('toast');

// API Console Elements
const apiMethod = document.getElementById('apiMethod');
const apiUrl = document.getElementById('apiUrl');
const apiTokenInput = document.getElementById('apiTokenInput');
const apiBody = document.getElementById('apiBody');
const sendRequestBtn = document.getElementById('sendRequestBtn');
const responseStatus = document.getElementById('responseStatus');
const responseTime = document.getElementById('responseTime');
const responseJson = document.getElementById('responseJson');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  renderAuthUI();
  setupEventListeners();
  loadPosts();
  updateApiConsoleToken();
});

// Toast notification helper
function showToast(message, type = 'info') {
  toastEl.textContent = message;
  toastEl.className = `toast ${type} show`;
  setTimeout(() => {
    toastEl.className = 'toast';
  }, 3500);
}

// Render Auth buttons or user profile pill
function renderAuthUI() {
  if (state.token && state.user) {
    authSection.innerHTML = `
      <div class="user-badge" title="${state.user.email}">
        <img src="${state.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" alt="${state.user.name}">
        <span class="user-badge-name">${state.user.name}</span>
        <span class="role-tag">${state.user.role || 'user'}</span>
      </div>
      <button class="btn btn-secondary" id="logoutBtn" style="padding: 0.35rem 0.8rem; font-size: 0.8rem;">Logout</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('createAuthWarning').classList.add('hidden');
  } else {
    authSection.innerHTML = `
      <button class="btn btn-secondary" id="openLoginBtn">Sign In</button>
      <button class="btn btn-primary" id="openRegisterBtn">Get Started</button>
    `;
    document.getElementById('openLoginBtn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('openRegisterBtn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('createAuthWarning').classList.remove('hidden');
  }
}

function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  renderAuthUI();
  updateApiConsoleToken();
  showToast('You have been logged out', 'info');
  loadPosts();
}

function updateApiConsoleToken() {
  if (state.token) {
    apiTokenInput.value = `Bearer ${state.token}`;
  } else {
    apiTokenInput.value = '';
  }
}

// Event Listeners
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = `tab-${btn.dataset.tab}`;
      const panel = document.getElementById(tabId);
      if (panel) panel.classList.add('active');

      if (btn.dataset.tab === 'feed') {
        loadPosts();
      }
    });
  });

  // Category filter
  categoryFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('cat-pill')) {
      document.querySelectorAll('.cat-pill').forEach((p) => p.classList.remove('active'));
      e.target.classList.add('active');
      state.currentCategory = e.target.dataset.cat;
      state.page = 1;
      loadPosts();
    }
  });

  // Search input debounced
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = e.target.value.trim();
      state.page = 1;
      loadPosts();
    }, 350);
  });

  // Modal Closers
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    postModal.classList.remove('open');
  });
  document.getElementById('closeAuthModalBtn').addEventListener('click', () => {
    authModal.classList.remove('open');
  });

  postModal.addEventListener('click', (e) => {
    if (e.target === postModal) postModal.classList.remove('open');
  });
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) authModal.classList.remove('open');
  });

  // Auth Tabs (Login vs Register)
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  tabLoginBtn.addEventListener('click', () => {
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  });

  tabRegisterBtn.addEventListener('click', () => {
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  });

  // Quick fill buttons
  document.querySelectorAll('.quick-fill-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('loginEmail').value = btn.dataset.email;
      document.getElementById('loginPassword').value = btn.dataset.pass;
    });
  });

  // Login form submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errBox = document.getElementById('loginError');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      state.token = data.data.token;
      state.user = data.data.user;
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));

      renderAuthUI();
      updateApiConsoleToken();
      authModal.classList.remove('open');
      showToast(`Welcome back, ${state.user.name}!`, 'success');
      errBox.classList.add('hidden');
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.remove('hidden');
    }
  });

  // Register form submit
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const bio = document.getElementById('regBio').value;
    const errBox = document.getElementById('registerError');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, bio })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      state.token = data.data.token;
      state.user = data.data.user;
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));

      renderAuthUI();
      updateApiConsoleToken();
      authModal.classList.remove('open');
      showToast('Account created successfully!', 'success');
      errBox.classList.add('hidden');
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.remove('hidden');
    }
  });

  // Post form submit (Create / Edit)
  const postForm = document.getElementById('postForm');
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!state.token) {
      openAuthModal('login');
      showToast('Please sign in first to publish articles', 'error');
      return;
    }

    const editId = document.getElementById('editPostId').value;
    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value;
    const tags = document.getElementById('postTags').value;
    const coverImage = document.getElementById('postCover').value;
    const content = document.getElementById('postContent').value;

    const payload = {
      title,
      category,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      coverImage: coverImage || undefined,
      content
    };

    try {
      const endpoint = editId ? `/api/posts/${editId}` : '/api/posts';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save post');

      showToast(editId ? 'Post updated successfully!' : 'Post published successfully!', 'success');
      postForm.reset();
      document.getElementById('editPostId').value = '';
      document.getElementById('formTitle').textContent = 'Create New Blog Article';
      document.getElementById('savePostBtn').textContent = 'Publish Article';
      document.getElementById('cancelEditBtn').style.display = 'none';

      // Switch to feed
      document.querySelector('[data-tab="feed"]').click();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Cancel edit button
  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    postForm.reset();
    document.getElementById('editPostId').value = '';
    document.getElementById('formTitle').textContent = 'Create New Blog Article';
    document.getElementById('savePostBtn').textContent = 'Publish Article';
    document.getElementById('cancelEditBtn').style.display = 'none';
  });

  // API Console Sidebar Clicks
  document.querySelectorAll('.endpoint-item').forEach((item) => {
    item.addEventListener('click', () => {
      const method = item.dataset.method;
      const endpoint = item.dataset.endpoint;

      apiMethod.value = method;
      apiUrl.value = endpoint;

      if (endpoint === '/api/auth/register') {
        apiBody.value = JSON.stringify({
          name: "Tester Dev",
          email: `tester_${Math.floor(Math.random() * 1000)}@example.com`,
          password: "password123",
          bio: "Software developer & API enthusiast"
        }, null, 2);
      } else if (endpoint === '/api/auth/login') {
        apiBody.value = JSON.stringify({
          email: "alex@example.com",
          password: "password123"
        }, null, 2);
      } else if (endpoint === '/api/posts' && method === 'POST') {
        apiBody.value = JSON.stringify({
          title: "My New Tech Exploration",
          category: "Technology",
          tags: ["nodejs", "webdev"],
          coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
          content: "Detailed technical writeup and thoughts here..."
        }, null, 2);
      } else if (endpoint === '/api/comments') {
        apiBody.value = JSON.stringify({
          postId: state.currentPost ? state.currentPost._id : "<replace_with_valid_post_id>",
          content: "Great article! Very clear and helpful."
        }, null, 2);
      } else {
        apiBody.value = '';
      }
    });
  });

  // API Console Send Request
  sendRequestBtn.addEventListener('click', async () => {
    const method = apiMethod.value;
    const url = apiUrl.value.trim();
    const tokenHeader = apiTokenInput.value.trim();
    const rawBody = apiBody.value.trim();

    const headers = {};
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      headers['Content-Type'] = 'application/json';
    }
    if (tokenHeader) {
      headers['Authorization'] = tokenHeader.startsWith('Bearer ') ? tokenHeader : `Bearer ${tokenHeader}`;
    }

    responseStatus.textContent = 'Sending...';
    responseStatus.style.background = '#374151';
    responseStatus.style.color = '#fff';
    responseJson.textContent = 'Awaiting response...';

    const startTime = performance.now();
    try {
      const options = {
        method,
        headers
      };
      if (['POST', 'PUT', 'PATCH'].includes(method) && rawBody) {
        options.body = rawBody;
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      responseTime.textContent = `${duration} ms`;
      responseStatus.textContent = `${res.status} ${res.statusText}`;

      if (res.status >= 200 && res.status < 300) {
        responseStatus.style.background = 'rgba(16, 185, 129, 0.2)';
        responseStatus.style.color = '#34d399';
      } else {
        responseStatus.style.background = 'rgba(239, 68, 68, 0.2)';
        responseStatus.style.color = '#f87171';
      }

      const json = await res.json();
      responseJson.textContent = JSON.stringify(json, null, 2);

      // If login or register was tested in console, offer to adopt token
      if (json.data && json.data.token && (url.includes('/login') || url.includes('/register'))) {
        state.token = json.data.token;
        state.user = json.data.user;
        localStorage.setItem('token', state.token);
        localStorage.setItem('user', JSON.stringify(state.user));
        renderAuthUI();
        updateApiConsoleToken();
        showToast('Logged in via API Console!', 'success');
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      responseTime.textContent = `${duration} ms`;
      responseStatus.textContent = 'ERROR';
      responseStatus.style.background = 'rgba(239, 68, 68, 0.2)';
      responseStatus.style.color = '#f87171';
      responseJson.textContent = `Request failed: ${err.message}`;
    }
  });
}

function openAuthModal(defaultTab = 'login') {
  authModal.classList.add('open');
  if (defaultTab === 'login') {
    document.getElementById('tabLoginBtn').click();
  } else {
    document.getElementById('tabRegisterBtn').click();
  }
}

// Fetch and Render Posts Feed
async function loadPosts() {
  postsGrid.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading published articles...</p>
    </div>
  `;

  try {
    let url = `/api/posts?page=${state.page}&limit=9`;
    if (state.currentCategory) url += `&category=${encodeURIComponent(state.currentCategory)}`;
    if (state.searchQuery) url += `&search=${encodeURIComponent(state.searchQuery)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to fetch posts');

    document.getElementById('statPostsCount').textContent = data.pagination?.total || data.data.posts.length;

    if (!data.data.posts || data.data.posts.length === 0) {
      postsGrid.innerHTML = `
        <div class="empty-state">
          <h3>No articles found</h3>
          <p>Try clearing your search query or publish a new article.</p>
        </div>
      `;
      return;
    }

    postsGrid.innerHTML = data.data.posts.map((post) => createPostCardHtml(post)).join('');

    // Attach click listeners to cards
    document.querySelectorAll('.post-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const postId = card.dataset.id;
        openPostDetail(postId);
      });
    });
  } catch (err) {
    postsGrid.innerHTML = `
      <div class="empty-state">
        <h3 style="color: var(--danger);">Failed to load posts</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
}

function createPostCardHtml(post) {
  const authorName = post.author ? post.author.name : 'Unknown Author';
  const authorAvatar = post.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  const dateStr = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const tagsHtml = (post.tags || []).slice(0, 3).map((t) => `<span class="post-tag">#${t}</span>`).join('');

  return `
    <article class="post-card" data-id="${post._id}">
      <img src="${post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(post.title)}" class="post-cover" loading="lazy">
      <div class="post-card-body">
        <div class="post-meta-top">
          <span class="post-category-tag">${escapeHtml(post.category || 'General')}</span>
          <span class="post-date">${dateStr}</span>
        </div>
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <p class="post-excerpt">${escapeHtml(post.excerpt || post.content.substring(0, 120) + '...')}</p>
        
        <div class="post-tags-row">${tagsHtml}</div>

        <div class="post-card-footer">
          <div class="author-info">
            <img src="${authorAvatar}" class="author-avatar" alt="${escapeHtml(authorName)}">
            <span class="author-name">${escapeHtml(authorName)}</span>
          </div>
          <div class="post-stats">
            <span>❤️ ${post.likes?.length || 0}</span>
            <span>👁️ ${post.views || 0}</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

// Open Single Post Detail Modal
async function openPostDetail(idOrSlug) {
  postModal.classList.add('open');
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading full story & comments...</p>
    </div>
  `;

  try {
    const res = await fetch(`/api/posts/${idOrSlug}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Post not found');

    const post = data.data.post;
    const comments = data.data.comments || [];
    state.currentPost = post;

    const authorName = post.author?.name || 'Author';
    const authorAvatar = post.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    const isLiked = state.user && post.likes?.some((id) => id.toString() === state.user._id.toString());
    const isAuthor = state.user && (post.author?._id === state.user._id || state.user.role === 'admin');

    modalBody.innerHTML = `
      <img src="${post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'}" class="detail-cover" alt="${escapeHtml(post.title)}">
      
      <div class="detail-header">
        <div class="post-meta-top">
          <span class="post-category-tag">${escapeHtml(post.category)}</span>
          <span class="post-date">${new Date(post.createdAt).toLocaleDateString()} &bull; ${post.views} views</span>
        </div>
        <h1 class="detail-title">${escapeHtml(post.title)}</h1>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 1rem;">
          <div class="author-info">
            <img src="${authorAvatar}" class="author-avatar" style="width:36px; height:36px;" alt="${escapeHtml(authorName)}">
            <div>
              <div class="author-name">${escapeHtml(authorName)}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(post.author?.bio || 'Contributor')}</div>
            </div>
          </div>

          ${isAuthor ? `
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-secondary" id="editPostBtn" style="padding:0.35rem 0.75rem; font-size:0.8rem;">✏️ Edit</button>
              <button class="btn btn-danger" id="deletePostBtn" style="padding:0.35rem 0.75rem; font-size:0.8rem;">🗑️ Delete</button>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="detail-content">${escapeHtml(post.content)}</div>

      <div class="interaction-bar">
        <button class="like-btn ${isLiked ? 'liked' : ''}" id="likePostBtn">
          <span>${isLiked ? '❤️' : '🤍'}</span>
          <span id="likeCountText">${post.likes?.length || 0} Likes</span>
        </button>
        <span style="font-size:0.85rem; color:var(--text-muted);">${comments.length} Comments</span>
      </div>

      <!-- Comments Section -->
      <div class="comments-section">
        <h3>Discussion (${comments.length})</h3>
        
        <div class="comment-input-box">
          <textarea id="newCommentInput" rows="2" placeholder="${state.token ? 'Share your thoughts on this article...' : 'Sign in to join the discussion'}"></textarea>
          <button class="btn btn-primary" id="submitCommentBtn">Post Comment</button>
        </div>

        <div class="comment-list" id="modalCommentsList">
          ${comments.length === 0 ? '<p style="color:var(--text-dim); font-size:0.9rem;">No comments yet. Be the first to share your thoughts!</p>' : ''}
          ${comments.map((c) => createCommentHtml(c)).join('')}
        </div>
      </div>
    `;

    // Hook like button
    document.getElementById('likePostBtn').addEventListener('click', () => handleToggleLike(post._id));

    // Hook comment submit
    document.getElementById('submitCommentBtn').addEventListener('click', () => handleAddComment(post._id));

    // Hook edit/delete if authorized
    if (isAuthor) {
      document.getElementById('editPostBtn').addEventListener('click', () => handleTriggerEdit(post));
      document.getElementById('deletePostBtn').addEventListener('click', () => handleDeletePost(post._id));
    }

    // Hook delete comment buttons
    document.querySelectorAll('.delete-comment-btn').forEach((btn) => {
      btn.addEventListener('click', () => handleDeleteComment(btn.dataset.commentId, post._id));
    });

  } catch (err) {
    modalBody.innerHTML = `
      <div class="empty-state">
        <h3 style="color: var(--danger);">Failed to load post</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
}

function createCommentHtml(comment) {
  const authorName = comment.author?.name || 'Anonymous';
  const authorAvatar = comment.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
  const timeStr = new Date(comment.createdAt).toLocaleDateString();
  const canDelete = state.user && (comment.author?._id === state.user._id || state.user.role === 'admin');

  return `
    <div class="comment-item">
      <div class="comment-header">
        <div class="author-info">
          <img src="${authorAvatar}" class="author-avatar" style="width:24px; height:24px;" alt="${escapeHtml(authorName)}">
          <span class="comment-author">${escapeHtml(authorName)}</span>
          <span class="comment-time">&bull; ${timeStr}</span>
        </div>
        ${canDelete ? `<button class="delete-comment-btn" data-comment-id="${comment._id}" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:0.8rem;">✕ Delete</button>` : ''}
      </div>
      <div class="comment-text">${escapeHtml(comment.content)}</div>
    </div>
  `;
}

// Handle Like Toggle
async function handleToggleLike(postId) {
  if (!state.token) {
    openAuthModal('login');
    showToast('Please sign in to like articles', 'info');
    return;
  }

  try {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to like');

    const likeBtn = document.getElementById('likePostBtn');
    const likeCountText = document.getElementById('likeCountText');

    if (data.data.isLiked) {
      likeBtn.classList.add('liked');
      likeBtn.querySelector('span:first-child').textContent = '❤️';
    } else {
      likeBtn.classList.remove('liked');
      likeBtn.querySelector('span:first-child').textContent = '🤍';
    }
    likeCountText.textContent = `${data.data.likesCount} Likes`;

    // Refresh feed in background
    loadPosts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Handle Adding a Comment
async function handleAddComment(postId) {
  if (!state.token) {
    openAuthModal('login');
    showToast('Please sign in to post a comment', 'info');
    return;
  }

  const commentInput = document.getElementById('newCommentInput');
  const content = commentInput.value.trim();

  if (!content) {
    showToast('Comment cannot be empty', 'error');
    return;
  }

  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ postId, content })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to post comment');

    showToast('Comment posted!', 'success');
    commentInput.value = '';
    openPostDetail(postId); // Refresh modal
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Handle Comment Deletion
async function handleDeleteComment(commentId, postId) {
  if (!confirm('Are you sure you want to delete this comment?')) return;

  try {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete comment');

    showToast('Comment removed', 'success');
    openPostDetail(postId);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Trigger Edit Post
function handleTriggerEdit(post) {
  postModal.classList.remove('open');
  document.querySelector('[data-tab="create"]').click();

  document.getElementById('editPostId').value = post._id;
  document.getElementById('postTitle').value = post.title;
  document.getElementById('postCategory').value = post.category || 'Technology';
  document.getElementById('postTags').value = (post.tags || []).join(', ');
  document.getElementById('postCover').value = post.coverImage || '';
  document.getElementById('postContent').value = post.content;

  document.getElementById('formTitle').textContent = 'Edit Blog Article';
  document.getElementById('savePostBtn').textContent = 'Update Article';
  document.getElementById('cancelEditBtn').style.display = 'inline-flex';
}

// Delete Post
async function handleDeletePost(postId) {
  if (!confirm('Are you sure you want to permanently delete this article?')) return;

  try {
    const res = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete post');

    postModal.classList.remove('open');
    showToast('Post deleted successfully', 'success');
    loadPosts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
