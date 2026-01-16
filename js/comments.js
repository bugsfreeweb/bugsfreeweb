// =====================================================
// Enhanced Comments System - Premium Design
// Features: Google Auth, Replies, Public Viewing, Date/Time Display
// =====================================================

(function() {
  'use strict';

  // Global State
  let currentUser = null;
  let commentsListener = null;
  let targetId = '';
  let targetType = '';
  let currentSection = 'blog'; // 'blog' or 'project'
  let authUnsubscribe = null;

  // =====================================================
  // Get Firebase services
  // =====================================================
  function getFirebase() {
    if (window.firebaseServices && window.firebaseServices.db) {
      return {
        db: window.firebaseServices.db,
        auth: window.firebaseServices.auth,
        googleProvider: window.firebaseServices.googleProvider
      };
    }
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      return {
        db: firebase.firestore(),
        auth: firebase.auth(),
        googleProvider: null
      };
    }
    return null;
  }

  // =====================================================
  // Initialization
  // =====================================================
  function initializeComments(targetSlug, type) {
    targetId = targetSlug;
    targetType = type;
    currentSection = type;

    const firebase = getFirebase();
    if (!firebase) {
      console.log('Firebase not available for comments');
      return;
    }

    // Check for existing user
    if (firebase.auth) {
      currentUser = firebase.auth.currentUser;
      updateAuthUI();
    }

    // Listen for auth changes
    if (firebase.auth) {
      // Clean up previous listener
      if (authUnsubscribe) {
        authUnsubscribe();
      }
      authUnsubscribe = firebase.auth.onAuthStateChanged((user) => {
        currentUser = user;
        updateAuthUI();
      });
    }

    // Load comments
    loadComments();
    setupCommentForm();
  }

  // =====================================================
  // Authentication UI
  // =====================================================
  function updateAuthUI() {
    const section = currentSection;
    const authContainer = document.getElementById(`${section}CommentsAuth`);
    const formContainer = document.getElementById(`${section}CommentsForm`);
    const userInfo = document.getElementById(`${section}CommentUserInfo`);
    const userAvatar = document.getElementById(`${section}CommentUserAvatar`);
    const userName = document.getElementById(`${section}CommentUserName`);

    if (!authContainer) return;

    if (currentUser) {
      // User is logged in - show form
      authContainer.style.display = 'none';
      if (formContainer) formContainer.style.display = 'flex';
      if (userInfo) userInfo.style.display = 'flex';
      if (userAvatar && currentUser.photoURL) {
        userAvatar.src = currentUser.photoURL;
        userAvatar.style.display = 'block';
      }
      if (userName) userName.textContent = currentUser.displayName || 'Anonymous';
    } else {
      // User not logged in - show auth prompt
      authContainer.style.display = 'flex';
      if (formContainer) formContainer.style.display = 'none';
      if (userInfo) userInfo.style.display = 'none';
    }
  }

  // =====================================================
  // Google Sign-In
  // =====================================================
  async function signInWithGoogle() {
    try {
      const firebase = getFirebase();
      if (!firebase || !firebase.auth) {
        showToast('Authentication not available', 'error');
        return;
      }

      // Use provider from firebaseServices or create new one
      let provider;
      if (window.firebaseServices && window.firebaseServices.googleProvider) {
        provider = window.firebaseServices.googleProvider;
      } else {
        provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
      }

      await firebase.auth.signInWithPopup(provider);
      showToast('Successfully signed in!', 'success');
    } catch (error) {
      console.error('Sign in error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        showToast('Failed to sign in. Please try again.', 'error');
      }
    }
  }

  // =====================================================
  // Comment Form Setup
  // =====================================================
  function setupCommentForm() {
    const section = currentSection;
    const textarea = document.getElementById(`${section}CommentText`);
    const submitBtn = document.getElementById(`${section}SubmitComment`);
    const charCount = document.getElementById(`${section}CommentCharCount`);

    if (textarea && submitBtn) {
      // Character count
      textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        if (charCount) charCount.textContent = `${length}/1000`;
        submitBtn.disabled = length < 2 || length > 1000;
      });

      // Submit comment
      submitBtn.addEventListener('click', () => submitComment(false));
    }
  }

  // =====================================================
  // Submit Comment (Main or Reply)
  // =====================================================
  async function submitComment(isReply = false, parentId = null) {
    const section = currentSection;
    const textarea = document.getElementById(isReply ? `${section}ReplyText` : `${section}CommentText`);
    const submitBtn = document.getElementById(isReply ? `${section}SubmitReply` : `${section}SubmitComment`);

    if (!textarea || !textarea.value.trim()) return;

    // Require authentication for posting
    if (!currentUser) {
      showToast('Please sign in to comment', 'info');
      signInWithGoogle();
      return;
    }

    const content = textarea.value.trim();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-feather="loader" class="spin"></i> Posting...';

    try {
      const firebase = getFirebase();
      if (!firebase || !firebase.db) throw new Error('Database not available');

      const commentData = {
        targetId: targetId,
        targetType: targetType,
        content: content,
        author: {
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Anonymous',
          photoURL: currentUser.photoURL || null
        },
        createdAt: new Date().toISOString(),
        isVisible: false, // Requires admin approval before becoming visible
        parentId: parentId || null,
        replyCount: 0
      };

      await firebase.db.collection('comments').add(commentData);

      textarea.value = '';
      if (!isReply) {
        const charCount = document.getElementById(`${section}CommentCharCount`);
        if (charCount) charCount.textContent = '0/1000';
      }
      showToast(isReply ? 'Reply submitted for approval!' : 'Comment submitted for approval! Your comment will be visible after admin review.', 'success');

    } catch (error) {
      console.error('Error posting comment:', error);
      showToast('Failed to post. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = isReply
        ? '<i data-feather="corner-down-left"></i> Reply'
        : '<i data-feather="send"></i> Post Comment';
      if (typeof feather !== 'undefined') feather.replace();
    }
  }

  // =====================================================
  // Load Comments (With Replies Support)
  // Using onSnapshot for real-time updates
  // =====================================================
  function loadComments() {
    const section = currentSection;
    const container = document.getElementById(`${section}CommentsList`);
    const countEl = document.getElementById(`${section}CommentsCount`);

    if (!container) return;

    const firebase = getFirebase();
    if (!firebase || !firebase.db) {
      if (countEl) countEl.textContent = '0';
      container.innerHTML = '<div class="comments-error"><i data-feather="alert-circle"></i><p>Comments unavailable</p></div>';
      return;
    }

    // Cleanup previous listener (handle both Promise and function)
    if (typeof commentsListener === 'function') {
      commentsListener();
    }
    commentsListener = null;

    // Show loading skeleton
    container.innerHTML = `
      <div class="comments-loading">
        ${Array(3).fill().map(() => `
          <div class="skeleton-comment">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
              <div class="skeleton-line short"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Use onSnapshot for real-time updates
    commentsListener = firebase.db
      .collection('comments')
      .where('targetId', '==', targetId)
      .where('targetType', '==', targetType)
      .where('isVisible', '==', true)
      .onSnapshot((snapshot) => {
        const allComments = [];
        snapshot.forEach((doc) => {
          allComments.push({ id: doc.id, ...doc.data() });
        });

        // Sort by createdAt in memory (newest first)
        allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Separate parent comments and replies
        const parentComments = allComments.filter(c => !c.parentId);
        const replies = allComments.filter(c => c.parentId);

        // Count total (including replies)
        const totalCount = allComments.length;
        if (countEl) countEl.textContent = totalCount;

        // Update global comment count for display
        updateGlobalCommentCount(targetType, targetId, totalCount);

        if (allComments.length === 0) {
          container.innerHTML = `
            <div class="comments-empty">
              <div class="empty-icon">
                <i data-feather="message-circle"></i>
              </div>
              <h4>No comments yet</h4>
              <p>Be the first to start the conversation!</p>
            </div>
          `;
        } else {
          // Render parent comments with their replies
          let html = '';
          for (const comment of parentComments) {
            const commentReplies = replies.filter(r => r.parentId === comment.id);
            commentReplies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            html += renderComment(comment, commentReplies);
          }
          container.innerHTML = html;
        }

        if (typeof feather !== 'undefined') feather.replace();
      }, (error) => {
        console.error('Error loading comments:', error);
        container.innerHTML = `
          <div class="comments-error">
            <i data-feather="alert-circle"></i>
            <p>Unable to load comments</p>
          </div>
        `;
      });
  }

  // =====================================================
  // Render Single Comment (With Replies)
  // =====================================================
  function renderComment(comment, replies = []) {
    const section = currentSection;
    const date = formatFullDate(comment.createdAt);
    const canDelete = currentUser && currentUser.uid === comment.author.uid;
    const replyCount = replies.length;

    const repliesHtml = replies.map(reply => {
      const replyDate = formatFullDate(reply.createdAt);
      const canDeleteReply = currentUser && currentUser.uid === reply.author.uid;
      return `
        <div class="reply-item" data-id="${reply.id}">
          <img
            src="${reply.author.photoURL || getAvatarUrl(reply.author.displayName, reply.author.email)}"
            alt="${escapeHtml(reply.author.displayName)}"
            class="reply-avatar"
            onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><rect fill=%22%236366f1%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22>${(reply.author.displayName || 'A').charAt(0).toUpperCase()}</text></svg>'"
          >
          <div class="reply-body">
            <div class="reply-header">
              <span class="reply-author">${escapeHtml(reply.author.displayName)}</span>
              <span class="reply-time">${replyDate}</span>
            </div>
            <div class="reply-content">${escapeHtml(reply.content)}</div>
            ${canDeleteReply ? `
              <button class="reply-delete" onclick="window.commentsSystem.deleteComment('${reply.id}')" title="Delete">
                <i data-feather="trash-2"></i>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="comment-item" data-id="${comment.id}">
        <img
          src="${comment.author.photoURL || getAvatarUrl(comment.author.displayName || 'A', comment.author.email)}"
          alt="${escapeHtml(comment.author.displayName)}"
          class="comment-avatar"
          onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><rect fill=%22%236366f1%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22>${(comment.author.displayName || 'A').charAt(0).toUpperCase()}</text></svg>'"
        >
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">${escapeHtml(comment.author.displayName)}</span>
            <span class="comment-badge">${currentUser && currentUser.uid === comment.author.uid ? 'You' : ''}</span>
            <span class="comment-time">${date}</span>
          </div>
          <div class="comment-content">${escapeHtml(comment.content)}</div>
          <div class="comment-actions">
            ${replyCount > 0 ? `
              <button class="comment-action-btn" onclick="window.commentsSystem.toggleReplies('${comment.id}')">
                <i data-feather="corner-down-right"></i>
                <span>${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}</span>
              </button>
            ` : ''}
            <button class="comment-action-btn" onclick="window.commentsSystem.showReplyForm('${comment.id}')">
              <i data-feather="corner-down-left"></i>
              <span>Reply</span>
            </button>
            ${canDelete ? `
              <button class="comment-action-btn delete" onclick="window.commentsSystem.deleteComment('${comment.id}')">
                <i data-feather="trash-2"></i>
                <span>Delete</span>
              </button>
            ` : ''}
          </div>

          <!-- Reply Form -->
          <div class="reply-form" id="${section}ReplyForm_${comment.id}" style="display: none;">
            <div class="reply-form-content">
              <textarea
                class="reply-textarea"
                id="${section}ReplyText_${comment.id}"
                placeholder="Write a reply..."
                maxlength="1000"
              ></textarea>
              <div class="reply-form-footer">
                <span class="reply-char-count" id="${section}ReplyCharCount_${comment.id}">0/1000</span>
                <div class="reply-form-buttons">
                  <button class="reply-cancel-btn" onclick="window.commentsSystem.hideReplyForm('${comment.id}')">Cancel</button>
                  <button class="reply-submit-btn" id="${section}SubmitReply_${comment.id}" onclick="window.commentsSystem.submitReply('${comment.id}')" disabled>
                    <i data-feather="corner-down-left"></i> Reply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Replies Section -->
          <div class="replies-section" id="${section}Replies_${comment.id}" style="display: none;">
            ${repliesHtml}
          </div>
        </div>
      </div>
    `;
  }

  // =====================================================
  // Reply Functions
  // =====================================================
  window.showReplyForm = function(commentId) {
    const section = currentSection;
    const form = document.getElementById(`${section}ReplyForm_${commentId}`);
    if (form) {
      form.style.display = 'block';
      const textarea = document.getElementById(`${section}ReplyText_${commentId}`);
      if (textarea) {
        textarea.focus();
        // Setup character count for reply
        textarea.addEventListener('input', () => {
          const length = textarea.value.length;
          const charCount = document.getElementById(`${section}ReplyCharCount_${commentId}`);
          if (charCount) charCount.textContent = `${length}/1000`;
          const submitBtn = document.getElementById(`${section}SubmitReply_${commentId}`);
          if (submitBtn) submitBtn.disabled = length < 2 || length > 1000;
        });
      }
    }
  };

  window.hideReplyForm = function(commentId) {
    const section = currentSection;
    const form = document.getElementById(`${section}ReplyForm_${commentId}`);
    if (form) form.style.display = 'none';
  };

  window.submitReply = function(commentId) {
    submitComment(true, commentId);
  };

  window.toggleReplies = function(commentId) {
    const section = currentSection;
    const repliesSection = document.getElementById(`${section}Replies_${commentId}`);
    if (repliesSection) {
      repliesSection.style.display = repliesSection.style.display === 'none' ? 'block' : 'none';
    }
  };

  // =====================================================
  // Delete Comment
  // =====================================================
  async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const firebase = getFirebase();
      if (!firebase || !firebase.db) throw new Error('Database not available');

      await firebase.db.collection('comments').doc(commentId).update({
        isVisible: false
      });

      showToast('Comment deleted', 'success');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showToast('Failed to delete comment', 'error');
    }
  }

  // =====================================================
  // Update Global Comment Count (for cards)
  // =====================================================
  function updateGlobalCommentCount(type, id, count) {
    const countId = type === 'blog' ? `blogCommentsCount_${id}` : `projectCommentsCount_${id}`;
    const countEl = document.getElementById(countId);
    if (countEl) {
      countEl.textContent = count;
      countEl.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }

  // =====================================================
  // Helper Functions
  // =====================================================
  function formatFullDate(dateString) {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Format based on recency
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // Show full date and time for older comments
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getAvatarUrl(name, email) {
    // Use email for better avatar generation, fallback to name
    const identifier = email || name || 'A';
    // Clean the identifier to avoid encoding issues
    const cleanIdentifier = String(identifier).replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'A';
    // Use initials from name if available
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : cleanIdentifier.substring(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=fff&size=128`;
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('commentsToast');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `comments-toast ${type}`;
    toast.innerHTML = `
      <i data-feather="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (typeof feather !== 'undefined') feather.replace();

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // =====================================================
  // Export Functions
  // =====================================================
  window.commentsSystem = {
    initialize: initializeComments,
    signIn: signInWithGoogle,
    deleteComment: deleteComment,
    showReplyForm: window.showReplyForm,
    hideReplyForm: window.hideReplyForm,
    submitReply: window.submitReply,
    toggleReplies: window.toggleReplies
  };

})();
