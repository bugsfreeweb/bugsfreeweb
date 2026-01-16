// Firebase Authentication and Database Functions for Bugsfree Admin Dashboard
// This file handles all Firebase operations with graceful fallback for demo mode

// ==================== HELPER FUNCTIONS ====================

/**
 * Get Firebase services safely
 */
const getFirebaseServices = () => {
  if (window.firebaseServices && window.firebaseServices.isInitialized()) {
    return {
      auth: window.firebaseServices.auth,
      db: window.firebaseServices.db
    };
  }
  return null;
};

/**
 * Check if Firebase is available
 */
const isFirebaseReady = () => {
  return window.firebaseServices && window.firebaseServices.isInitialized();
};

/**
 * Throw error if Firebase is not initialized
 */
const requireFirebase = () => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase is not configured. Please update js/firebase/config.js with your credentials.');
  }
};

// ==================== AUTHENTICATION FUNCTIONS ====================

/**
 * Sign in with email and password
 */
const signInWithEmail = async (email, password) => {
  requireFirebase();
  const services = getFirebaseServices();
  
  try {
    const userCredential = await services.auth.signInWithEmailAndPassword(email, password);
    
    // Log successful login
    await logSecurityEvent('login_success', {
      uid: userCredential.user.uid,
      email: email,
      timestamp: new Date().toISOString()
    });
    
    return userCredential;
  } catch (error) {
    await logSecurityEvent('login_failed', {
      email: email,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Sign out current user - uses signOutUser from config.js if available, otherwise provides fallback
 * This avoids duplicate declaration error while maintaining backward compatibility
 */
window.signOutUser = window.firebaseServices?.signOutUser || (async function() {
  if (!isFirebaseReady()) return;
  const services = getFirebaseServices();
  try {
    const user = services.auth.currentUser;
    if (user) {
      await logSecurityEvent('logout', {
        uid: user.uid,
        email: user.email,
        timestamp: new Date().toISOString()
      });
    }
    await services.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
});

/**
 * Send password reset email
 */
const resetPassword = async (email) => {
  requireFirebase();
  const services = getFirebaseServices();
  
  try {
    await services.auth.sendPasswordResetEmail(email);
    
    await logSecurityEvent('password_reset_requested', {
      email: email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Create new admin user (only for initial setup)
 */
const createAdminUser = async (email, password) => {
  requireFirebase();
  const services = getFirebaseServices();
  
  try {
    const userCredential = await services.auth.createUserWithEmailAndPassword(email, password);
    
    await services.db.collection('users').doc(userCredential.user.uid).set({
      email: email,
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true
    });
    
    return userCredential;
  } catch (error) {
    throw error;
  }
};

/**
 * Listen for auth state changes
 */
const onAuthStateChange = (callback) => {
  if (!isFirebaseReady()) {
    callback(null);
    return () => {};
  }
  
  const services = getFirebaseServices();
  return services.auth.onAuthStateChanged(callback);
};

// ==================== SECURITY FUNCTIONS ====================

/**
 * Log security events for audit trail
 */
const logSecurityEvent = async (eventType, eventData) => {
  if (!isFirebaseReady()) return;
  
  try {
    const services = getFirebaseServices();
    await services.db.collection('security_logs').add({
      eventType,
      eventData,
      userAgent: navigator.userAgent,
      timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

/**
 * Check if current user has admin role
 */
const isAdminUser = async () => {
  if (!isFirebaseReady()) return false;
  
  try {
    const services = getFirebaseServices();
    const user = services.auth.currentUser;
    if (!user) return false;
    
    const userDoc = await services.db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) return false;
    
    const userData = userDoc.data();
    return userData.role === 'admin' && userData.isActive === true;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};

// ==================== PROJECT FUNCTIONS ====================

/**
 * Get all projects from Firestore
 */
const getProjects = async () => {
  if (!isFirebaseReady()) return [];
  
  try {
    const services = getFirebaseServices();
    const snapshot = await services.db
      .collection('projects')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

/**
 * Add new project to Firestore
 */
const addProject = async (projectData) => {
  requireFirebase();
  const services = getFirebaseServices();
  
  try {
    const docRef = await services.db.collection('projects').add({
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    await logSecurityEvent('project_created', {
      projectId: docRef.id,
      projectName: projectData.name
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

/**
 * Update existing project
 */
const updateProject = async (projectId, projectData) => {
  requireFirebase();
  const services = getFirebaseServices();
  
  try {
    await services.db.collection('projects').doc(projectId).update({
      ...projectData,
      updatedAt: new Date().toISOString()
    });
    
    await logSecurityEvent('project_updated', {
      projectId,
      projectName: projectData.name
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

/**
 * Delete project from Firestore
 */
const deleteProject = async (projectId) => {
  requireFirebase();
  const services = getFirebaseServices();
  
  try {
    const project = await services.db.collection('projects').doc(projectId).get();
    const projectData = project.data();
    
    await services.db.collection('projects').doc(projectId).delete();
    
    // Log security event - handle case where projectData might be undefined
    await logSecurityEvent('project_deleted', {
      projectId,
      projectName: projectData?.name || 'Unknown'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time project updates
 */
const subscribeToProjects = (callback) => {
  if (!isFirebaseReady()) {
    callback([]);
    return () => {};
  }
  
  const services = getFirebaseServices();
  return services.db
    .collection('projects')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(projects);
    });
};

// ==================== BLOG FUNCTIONS ====================

/**
 * Get all blog posts from Firestore
 */
const getBlogPosts = async () => {
  if (!isFirebaseReady()) return [];
  
  try {
    const services = getFirebaseServices();
    const snapshot = await services.db
      .collection('blog_posts')
      .orderBy('publishedAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

/**
 * Add new blog post to Firestore
 */
const addBlogPost = async (postData) => {
  requireFirebase();
  const services = getFirebaseServices();
  
  try {
    const docRef = await services.db.collection('blog_posts').add({
      ...postData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    await logSecurityEvent('blog_post_created', {
      postId: docRef.id,
      postTitle: postData.title
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding blog post:', error);
    throw error;
  }
};

/**
 * Update existing blog post
 */
const updateBlogPost = async (postId, postData) => {
  requireFirebase();
  const services = getFirebaseServices();
  
  try {
    await services.db.collection('blog_posts').doc(postId).update({
      ...postData,
      updatedAt: new Date().toISOString()
    });
    
    await logSecurityEvent('blog_post_updated', {
      postId,
      postTitle: postData.title
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

/**
 * Delete blog post from Firestore
 */
const deleteBlogPost = async (postId) => {
  requireFirebase();
  const services = getFirebaseServices();
  
  try {
    const post = await services.db.collection('blog_posts').doc(postId).get();
    const postData = post.data();
    
    await services.db.collection('blog_posts').doc(postId).delete();
    
    await logSecurityEvent('blog_post_deleted', {
      postId,
      postTitle: postData.title
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time blog post updates
 */
const subscribeToBlogPosts = (callback) => {
  if (!isFirebaseReady()) {
    callback([]);
    return () => {};
  }
  
  const services = getFirebaseServices();
  return services.db
    .collection('blog_posts')
    .orderBy('publishedAt', 'desc')
    .onSnapshot((snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(posts);
    });
};

// ==================== SETTINGS FUNCTIONS ====================

/**
 * Get global settings from Firestore
 */
const getSettings = async () => {
  if (!isFirebaseReady()) return null;
  
  try {
    const services = getFirebaseServices();
    const doc = await services.db.collection('settings').doc('global').get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};

/**
 * Update global settings
 */
const updateSettings = async (settingsData) => {
  requireFirebase();
  const services = getFirebaseServices();
  
  try {
    await services.db.collection('settings').doc('global').set({
      ...settingsData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    await logSecurityEvent('settings_updated', {
      updatedFields: Object.keys(settingsData)
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time settings updates
 */
const subscribeToSettings = (callback) => {
  if (!isFirebaseReady()) {
    callback(null);
    return () => {};
  }
  
  const services = getFirebaseServices();
  return services.db
    .collection('settings')
    .doc('global')
    .onSnapshot((doc) => {
      callback(doc.data());
    });
};

// ==================== MEDIA FUNCTIONS ====================

/**
 * Get all media files from Firestore
 */
const getMediaLibrary = async () => {
  if (!isFirebaseReady()) return [];
  
  try {
    const services = getFirebaseServices();
    const snapshot = await services.db
      .collection('media')
      .orderBy('uploadedAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching media library:', error);
    return [];
  }
};

/**
 * Add media record to Firestore
 */
const addMediaRecord = async (mediaData) => {
  requireFirebase();
  const services = getFirebaseServices();
  
  try {
    await services.db.collection('media').add({
      ...mediaData,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding media record:', error);
    throw error;
  }
};

// ==================== ANALYTICS FUNCTIONS ====================

/**
 * Track page view
 */
const trackPageView = async (pagePath, pageTitle) => {
  if (!isFirebaseReady()) return;
  
  try {
    const services = getFirebaseServices();
    await services.db.collection('analytics').add({
      type: 'pageview',
      path: pagePath,
      title: pageTitle,
      timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

/**
 * Get visitor count for a date range
 */
const getVisitorStats = async (days = 30) => {
  if (!isFirebaseReady()) return { pageViews: 0, uniqueVisitors: 0, period: days };
  
  try {
    const services = getFirebaseServices();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const snapshot = await services.db
      .collection('analytics')
      .where('type', '==', 'pageview')
      .where('timestamp', '>=', startDate)
      .get();
    
    const pageViews = snapshot.docs.length;
    
    return {
      pageViews,
      uniqueVisitors: pageViews, // Simplified for demo
      period: days
    };
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    return { pageViews: 0, uniqueVisitors: 0, period: days };
  }
};

// ==================== EXPORT ALL FUNCTIONS ====================

window.firebaseDB = {
  // Auth functions
  signInWithEmail,
  signOutUser: window.signOutUser,
  resetPassword,
  createAdminUser,
  onAuthStateChange,
  isAdminUser,
  
  // Project functions
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  subscribeToProjects,
  
  // Blog functions
  getBlogPosts,
  addBlogPost,
  updateBlogPost,
  deleteBlogPost,
  subscribeToBlogPosts,
  
  // Settings functions
  getSettings,
  updateSettings,
  subscribeToSettings,
  
  // Media functions
  getMediaLibrary,
  addMediaRecord,
  
  // Analytics functions
  trackPageView,
  getVisitorStats,
  
  // Utility
  isFirebaseReady
};
