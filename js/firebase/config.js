// Firebase Configuration for Bugsfree Portfolio
// IMPORTANT: Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps

const firebaseConfig = {
  // API Key - Required for Firebase services
  apiKey: "AIzaSyCKlOFcvKiLzSIC98fxxsbemaHhfrVziFE",
  
  // Auth Domain - Your Firebase project ID followed by.firebaseapp.com
  authDomain: "bugsfree-profile.firebaseapp.com",
  
  // Database URL - For Realtime Database (optional, Firestore is used by default)
  databaseURL: "https://bugsfree-profile-default-rtdb.firebaseio.com",
  
  // Project ID - Your Firebase project identifier
  projectId: "bugsfree-profile",
  
  // Storage Bucket - For Firebase Storage (required for file uploads)
  storageBucket: "bugsfree-profile.firebasestorage.app",
  
  // Messaging Sender ID - From Firebase Console
  messagingSenderId: "567140642976",
  
  // App ID - From Firebase Console
  appId: "1:567140642976:web:b98374207a153b507499c5",
  
  // Measurement ID - For Analytics (optional)
  measurementId: "G-VFELQKKYHZ"
};

// Initialize Firebase only if properly configured
let auth = null;
let db = null;
let storage = null;
let firebaseInitialized = false;
let googleProvider = null;

try {
  // Check if Firebase SDK is loaded and config is valid
  if (typeof firebase !== 'undefined' && 
      firebaseConfig.apiKey && 
      firebaseConfig.apiKey !== 'YOUR_API_KEY_HERE') {
    
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Initialize Firebase Storage
    if (firebase.storage) {
      storage = firebase.storage();
      console.log('Firebase Storage initialized');
    }
    
    // Initialize Google Auth Provider
    googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
    
    // Note: We don't need to call settings() anymore - the default configuration works fine
    // This avoids the "overriding the original host" warning
    
  } else {
    console.log('Firebase not configured - using demo mode');
    console.log('Please update js/firebase/config.js with your Firebase credentials');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  firebaseInitialized = false;
}

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  return new Promise((resolve) => {
    if (!auth) {
      resolve(false);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
};

// Helper function to get current user
const getCurrentUser = () => {
  return auth ? auth.currentUser : null;
};

// Google Sign-In function
const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase not initialized');
  }
  try {
    const result = await auth.signInWithPopup(googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
};

// Sign out function
const signOutUser = async () => {
  if (!auth) {
    throw new Error('Firebase not initialized');
  }
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Export for use in other files
window.firebaseServices = {
  auth,
  db,
  storage,
  isAuthenticated,
  getCurrentUser,
  signInWithGoogle,
  signOutUser,
  googleProvider,
  isInitialized: () => firebaseInitialized
};
