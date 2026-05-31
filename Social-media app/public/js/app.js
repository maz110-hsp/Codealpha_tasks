// ===== Global State =====
let currentUser = null;
let currentPage = 1;
let isLoading = false;
let hasMore = true;

// ===== Utility Functions =====
function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function apiCall(url, options = {}) {
    try {
        // Include credentials for all requests (needed for file uploads and session auth)
        if (!options.credentials) {
            options.credentials = 'include';
        }
        
        const res = await fetch(url, options);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    } catch (err) {
        console.error('API error:', err);
        throw err;
    }
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        currentUser = await apiCall('/api/auth/me');
        initNav();
        initPage();
    } catch (err) {
        // Not logged in — pages that require auth will redirect via server
        initPage();
    }
});

function initNav() {
    if (!currentUser) return;

    // Set profile link
    const navProfile = document.getElementById('navProfile');
    if (navProfile) navProfile.href = '/profile/' + currentUser.username;

    // Set create post avatar
    const createPostAvatar = document.getElementById('createPostAvatar');
    if (createPostAvatar) createPostAvatar.src = currentUser.avatar;

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await apiCall('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        });
    }

    // Search
    initSearch();
}

function initPage() {
    const path = window.location.pathname;

    if (path === '/' || path === '/explore') {
        initFeed(path === '/explore' ? 'explore' : 'feed');
    }
}

// ===== Search =====
function initSearch() {
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;

    let timeout;
    input.addEventListener('input', () => {
        clearTimeout(timeout);
        const q = input.value.trim();
        if (q.length < 2) {
            results.classList.remove('active');
            return;
        }
        timeout = setTimeout(async () => {
            try {
                const users = await apiCall('/api/users?q=' + encodeURIComponent(q));
                if (users.length === 0) {
                    results.innerHTML = '<div style="padding:14px;color:var(--text-secondary);text-align:center">No users found</div>';
                } else {
                    results.innerHTML = users.map(u => `
            <a href="/profile/${escapeHtml(u.username)}" class="search-result-item">
              <img src="${escapeHtml(u.avatar)}" class="avatar avatar-sm" alt="${escapeHtml(u.username)}">
              <div>
                <div style="font-weight:600">${escapeHtml(u.display_name || u.username)}</div>
                <div style="font-size:0.8rem;color:var(--text-secondary)">@${escapeHtml(u.username)}</div>
              </div>
            </a>
          `).join('');
                }
                results.classList.add('active');
            } catch (err) {
                results.classList.remove('active');
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-search')) {
            results.classList.remove('active');
        }
    });
}

// ===== Feed =====
function initFeed(type) {
    initCreatePost();
    loadPosts(type);

    // Infinite scroll
    window.addEventListener('scroll', () => {
        if (isLoading || !hasMore) return;
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
            currentPage++;
            loadPosts(type);
        }
    });
}

async function loadPosts(type) {
    if (isLoading) return;
    isLoading = true;

    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';

    try {
        const endpoint = type === 'explore' ? '/api/explore' : '/api/feed';
        const posts = await apiCall(`${endpoint}?page=${currentPage}`);
        const container = document.getElementById('postsContainer');

        if (posts.length === 0) {
            hasMore = false;
            if (currentPage === 1) {
                const empty = document.getElementById('emptyState');
                if (empty) empty.style.display = 'block';
            }
        } else {
            posts.forEach(post => {
                container.insertAdjacentHTML('beforeend', renderPost(post));
            });
            if (posts.length < 10) hasMore = false;
        }
    } catch (err) {
        console.error('Load posts error:', err);
    } finally {
        isLoading = false;
        if (loading) loading.style.display = 'none';
    }
}

// ===== Create Post =====
function initCreatePost() {
    const openBtn = document.getElementById('openCreatePost');
    const modal = document.getElementById('createPostModal');
    const closeBtn = document.getElementById('closeCreatePost');
    const form = document.getElementById('createPostForm');
    const imageInput = document.getElementById('postImageInput');
    const imagePreview = document.getElementById('postImagePreview');
    const imagePreviewImg = document.getElementById('postImagePreviewImg');
    const removeImage = document.getElementById('removePostImage');

    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        document.getElementById('postContent').focus();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    if (imageInput) {
        imageInput.addEventListener('change', () => {
            const file = imageInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreviewImg.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeImage) {
        removeImage.addEventListener('click', () => {
            imageInput.value = '';
            imagePreview.style.display = 'none';
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('postContent').value.trim();
            if (!content) {
                alert('Post cannot be empty');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('content', content);
                if (imageInput && imageInput.files[0]) {
                    formData.append('image', imageInput.files[0]);
                }

                const post = await apiCall('/api/posts', {
                    method: 'POST',
                    body: formData
                });

                const container = document.getElementById('postsContainer');
                container.insertAdjacentHTML('afterbegin', renderPost(post));
                form.reset();
                imagePreview.style.display = 'none';
                modal.style.display = 'none';
                document.getElementById('emptyState').style.display = 'none';
            } catch (err) {
                alert(err.message);
            }
        });
    }
}

// ===== Post Rendering =====
function renderPost(post) {
    const isOwner = currentUser && currentUser.id === post.user_id;
    const liked = post.liked ? ' liked' : '';
    return `
    <div class="card post-item" id="post-${post.id}">
      <div class="post-header">
        <a href="/profile/${escapeHtml(post.username)}" class="post-author-link">
          <img src="${escapeHtml(post.avatar)}" class="avatar avatar-sm" alt="${escapeHtml(post.username)}">
          <div>
            <div style="font-weight:600">${escapeHtml(post.display_name || post.username)}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary)">@${escapeHtml(post.username)}</div>
          </div>
        </a>
        ${isOwner ? `<button class="btn-icon" onclick="deletePost(${post.id})" title="Delete">⋯</button>` : ''}
      </div>
      <p class="post-content">${escapeHtml(post.content)}</p>
      ${post.image ? `<img src="${escapeHtml(post.image)}" class="post-image" alt="Post image">` : ''}
      <div class="post-time">${timeAgo(post.created_at)}</div>
      <div class="post-actions">
        <button class="post-action ${liked}" onclick="toggleLike(${post.id}, this)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span id="likes-${post.id}">${post.like_count} ${post.like_count === 1 ? 'like' : 'likes'}</span>
        </button>
        <a href="/post/${post.id}" class="post-action">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span id="comments-${post.id}">${post.comment_count} ${post.comment_count === 1 ? 'comment' : 'comments'}</span>
        </a>
      </div>
    </div>
  `;
}

// ===== Interactions =====
async function toggleLike(postId, btn) {
    if (!currentUser) {
        alert('Please log in to like posts');
        return;
    }

    try {
        const data = await apiCall(`/api/posts/${postId}/like`, { method: 'POST' });
        const count = btn.querySelector('span');
        if (data.liked) {
            btn.classList.add('liked');
            btn.querySelector('svg').setAttribute('fill', 'currentColor');
        } else {
            btn.classList.remove('liked');
            btn.querySelector('svg').setAttribute('fill', 'none');
        }

        count.textContent = data.like_count + (data.like_count === 1 ? ' like' : ' likes');
    } catch (err) {
        console.error('Like error:', err);
    }
}

async function deletePost(postId) {
    if (!confirm('Delete this post?')) return;

    try {
        await apiCall(`/api/posts/${postId}`, { method: 'DELETE' });
        const el = document.getElementById('post-' + postId);
        if (el) el.remove();
    } catch (err) {
        alert(err.message);
    }
}

// ===== Profile Page =====
async function loadProfile(username) {
    try {
        const user = await apiCall('/api/users/' + encodeURIComponent(username));

        document.getElementById('profileDisplayName').textContent = user.display_name || user.username;
        document.getElementById('profileUsername').textContent = '@' + user.username;
        document.getElementById('profileBio').textContent = user.bio || '';
        document.getElementById('profileAvatar').src = user.avatar;
        document.getElementById('profilePosts').textContent = user.post_count;
        document.getElementById('profileFollowers').textContent = user.follower_count;
        document.getElementById('profileFollowing').textContent = user.following_count;

        document.title = (user.display_name || user.username) + ' - SocialApp';

        const actionBtn = document.getElementById('profileAction');
        if (currentUser && currentUser.id === user.id) {
            // Own profile — show edit
            actionBtn.textContent = 'Edit Profile';
            actionBtn.style.display = 'inline-flex';
            actionBtn.onclick = () => openEditProfile(user);
        } else if (currentUser) {
            // Other user — show follow/unfollow
            actionBtn.textContent = user.is_following ? 'Unfollow' : 'Follow';
            actionBtn.className = 'btn btn-sm ' + (user.is_following ? 'btn-secondary' : 'btn-primary');
            actionBtn.style.display = 'inline-flex';
            actionBtn.onclick = () => toggleFollow(username, actionBtn);
        }

        // Make followers/following clickable
        const followersStat = document.getElementById('profileFollowersStat');
        const followingStat = document.getElementById('profileFollowingStat');

        if (followersStat) {
            followersStat.onclick = () => showFollowersList(username);
        }
        if (followingStat) {
            followingStat.onclick = () => showFollowingList(username);
        }

        // Load user posts
        loadProfilePosts(username);
    } catch (err) {
        document.getElementById('profileHeader').innerHTML = '<div class="empty-state"><p>User not found</p></div>';
    }
}

async function loadProfilePosts(username) {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';

    try {
        const posts = await apiCall(`/api/users/${encodeURIComponent(username)}/posts?page=${currentPage}`);
        const container = document.getElementById('postsContainer');

        if (posts.length === 0 && currentPage === 1) {
            const empty = document.getElementById('emptyState');
            if (empty) empty.style.display = 'block';
        } else {
            posts.forEach(post => {
                container.insertAdjacentHTML('beforeend', renderPost(post));
            });
        }

        if (posts.length < 10) hasMore = false;

        // Infinite scroll for profile
        window.addEventListener('scroll', () => {
            if (isLoading || !hasMore) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
                currentPage++;
                isLoading = true;
                loadProfilePosts(username).then(() => { isLoading = false; });
            }
        });
    } catch (err) {
        console.error('Load profile posts error:', err);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

async function toggleFollow(username, btn) {
    try {
        const data = await apiCall(`/api/users/${encodeURIComponent(username)}/follow`, { method: 'POST' });
        btn.textContent = data.following ? 'Unfollow' : 'Follow';
        btn.className = 'btn btn-sm ' + (data.following ? 'btn-secondary' : 'btn-primary');
        document.getElementById('profileFollowers').textContent = data.follower_count;
    } catch (err) {
        console.error('Follow error:', err);
    }
}

async function showFollowersList(username) {
    const modal = document.getElementById('followersModal');
    const list = document.getElementById('followersList');
    
    if (!modal) return;
    
    try {
        const followers = await apiCall(`/api/users/${encodeURIComponent(username)}/followers`);
        
        if (followers.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>No followers yet</p></div>';
        } else {
            list.innerHTML = followers.map(user => `
                <a href="/profile/${escapeHtml(user.username)}" class="search-result-item" style="border-bottom: 1px solid var(--border-color); padding: 12px;">
                    <img src="${escapeHtml(user.avatar)}" class="avatar avatar-sm" alt="${escapeHtml(user.username)}">
                    <div>
                        <div style="font-weight:600">${escapeHtml(user.display_name || user.username)}</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary)">@${escapeHtml(user.username)}</div>
                    </div>
                </a>
            `).join('');
        }
        
        modal.style.display = 'flex';
    } catch (err) {
        console.error('Load followers error:', err);
        list.innerHTML = '<div class="empty-state"><p>Error loading followers</p></div>';
        modal.style.display = 'flex';
    }
}

async function showFollowingList(username) {
    const modal = document.getElementById('followingModal');
    const list = document.getElementById('followingList');
    
    if (!modal) return;
    
    try {
        const following = await apiCall(`/api/users/${encodeURIComponent(username)}/following`);
        
        if (following.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>Not following anyone yet</p></div>';
        } else {
            list.innerHTML = following.map(user => `
                <a href="/profile/${escapeHtml(user.username)}" class="search-result-item" style="border-bottom: 1px solid var(--border-color); padding: 12px;">
                    <img src="${escapeHtml(user.avatar)}" class="avatar avatar-sm" alt="${escapeHtml(user.username)}">
                    <div>
                        <div style="font-weight:600">${escapeHtml(user.display_name || user.username)}</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary)">@${escapeHtml(user.username)}</div>
                    </div>
                </a>
            `).join('');
        }
        
        modal.style.display = 'flex';
    } catch (err) {
        console.error('Load following error:', err);
        list.innerHTML = '<div class="empty-state"><p>Error loading following list</p></div>';
        modal.style.display = 'flex';
    }
}

function openEditProfile(user) {
    const modal = document.getElementById('editProfileModal');
    const deleteBtn = document.getElementById('deleteAvatarBtn');
    
    document.getElementById('editDisplayName').value = user.display_name || '';
    document.getElementById('editBio').value = user.bio || '';
    
    // Show delete avatar button only if not default avatar
    if (deleteBtn && user.avatar !== '/uploads/default-avatar.png') {
        deleteBtn.style.display = 'inline-block';
    } else if (deleteBtn) {
        deleteBtn.style.display = 'none';
    }
    
    modal.style.display = 'flex';

    // Close modal
    document.getElementById('closeEditProfile').onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    // Delete avatar functionality
    if (deleteBtn) {
        deleteBtn.onclick = async () => {
            if (!confirm('Delete your profile picture?')) return;
            try {
                const updated = await apiCall('/api/users/profile/avatar', { method: 'DELETE' });
                document.getElementById('profileAvatar').src = updated.avatar;
                deleteBtn.style.display = 'none';
                alert('Profile picture deleted successfully');
            } catch (err) {
                alert(err.message);
            }
        };
    }

    // Submit form
    document.getElementById('editProfileForm').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('display_name', document.getElementById('editDisplayName').value);
        formData.append('bio', document.getElementById('editBio').value);
        const avatarFile = document.getElementById('editAvatar').files[0];
        if (avatarFile) formData.append('avatar', avatarFile);

        try {
            const updated = await apiCall('/api/users/profile', {
                method: 'PUT',
                body: formData
            });
            document.getElementById('profileDisplayName').textContent = updated.display_name || updated.username;
            document.getElementById('profileBio').textContent = updated.bio || '';
            if (updated.avatar) document.getElementById('profileAvatar').src = updated.avatar;
            modal.style.display = 'none';
            currentUser = { ...currentUser, ...updated };
            if (deleteBtn && updated.avatar !== '/uploads/default-avatar.png') {
                deleteBtn.style.display = 'inline-block';
            }
        } catch (err) {
            alert(err.message);
        }
    };
}

// Close followers modal
document.addEventListener('DOMContentLoaded', () => {
    const closeFollowersBtn = document.getElementById('closeFollowersModal');
    const followersModal = document.getElementById('followersModal');
    if (closeFollowersBtn) {
        closeFollowersBtn.onclick = () => { followersModal.style.display = 'none'; };
    }
    if (followersModal) {
        followersModal.onclick = (e) => { if (e.target === followersModal) followersModal.style.display = 'none'; };
    }

    const closeFollowingBtn = document.getElementById('closeFollowingModal');
    const followingModal = document.getElementById('followingModal');
    if (closeFollowingBtn) {
        closeFollowingBtn.onclick = () => { followingModal.style.display = 'none'; };
    }
    if (followingModal) {
        followingModal.onclick = (e) => { if (e.target === followingModal) followingModal.style.display = 'none'; };
    }
});

// ===== Post Detail Page =====
async function loadPostDetail(postId) {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';

    try {
        const post = await apiCall('/api/posts/' + postId);
        document.getElementById('postDetail').innerHTML = renderPost(post);

        // Load comments
        const commentsSection = document.getElementById('commentsSection');
        commentsSection.style.display = 'block';

        if (currentUser) {
            const commentForm = document.getElementById('addCommentForm');
            commentForm.style.display = 'flex';
            commentForm.onsubmit = async (e) => {
                e.preventDefault();
                const input = document.getElementById('commentInput');
                const content = input.value.trim();
                if (!content) return;

                try {
                    const comment = await apiCall(`/api/posts/${postId}/comments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content })
                    });
                    document.getElementById('commentsContainer').insertAdjacentHTML('beforeend', renderComment(comment));
                    input.value = '';
                } catch (err) {
                    alert(err.message);
                }
            };
        }

        const comments = await apiCall(`/api/posts/${postId}/comments`);
        const container = document.getElementById('commentsContainer');
        if (comments.length === 0) {
            container.innerHTML = '<div class="empty-state" style="padding:20px"><p>No comments yet</p></div>';
        } else {
            container.innerHTML = comments.map(renderComment).join('');
        }
    } catch (err) {
        document.getElementById('postDetail').innerHTML = '<div class="empty-state"><p>Post not found</p></div>';
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function renderComment(comment) {
    const isOwner = currentUser && currentUser.id === comment.user_id;
    return `
    <div class="comment-item" id="comment-${comment.id}">
      <a href="/profile/${escapeHtml(comment.username)}">
        <img src="${escapeHtml(comment.avatar)}" class="avatar avatar-xs" alt="${escapeHtml(comment.username)}">
      </a>
      <div class="comment-body">
        <div class="comment-bubble">
          <a href="/profile/${escapeHtml(comment.username)}" class="comment-author">${escapeHtml(comment.display_name || comment.username)}</a>
          <div class="comment-text">${escapeHtml(comment.content)}</div>
        </div>
        <div class="comment-time">
          ${timeAgo(comment.created_at)}
          ${isOwner ? `<button class="comment-delete" onclick="deleteComment(${comment.id})">Delete</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

async function deleteComment(commentId) {
    if (!confirm('Delete this comment?')) return;
    try {
        await apiCall(`/api/comments/${commentId}`, { method: 'DELETE' });
        const el = document.getElementById('comment-' + commentId);
        if (el) el.remove();
    } catch (err) {
        alert(err.message);
    }
}
