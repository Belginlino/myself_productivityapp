import { Capacitor } from '@capacitor/core';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import { useAppStore } from '../store/useAppStore';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  redirecting?: boolean;
}

// Google Sign-In with Popup & Redirect Fallback
export const loginWithGoogle = async (options?: { useRedirect?: boolean }): Promise<AuthResult> => {
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // If redirect is explicitly requested or on Capacitor native platform
  if (options?.useRedirect) {
    try {
      await signInWithRedirect(auth, googleProvider);
      return { success: true, redirecting: true };
    } catch (err: any) {
      console.error('Google Redirect Error:', err);
      return { success: false, error: parseAuthError(err, currentHostname) };
    }
  }

  try {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
      } catch (popupErr: any) {
        console.warn('Native Google Popup Warning, falling back to redirect:', popupErr);
        if (
          popupErr.code === 'auth/popup-blocked' ||
          popupErr.code === 'auth/disallowed-useragent' ||
          popupErr.code === 'auth/operation-not-supported-in-this-environment' ||
          popupErr.message?.includes('useragent')
        ) {
          try {
            await signInWithRedirect(auth, googleProvider);
            return { success: true, redirecting: true };
          } catch (redErr: any) {
            return {
              success: false,
              error: 'Google OAuth restricts popups in Android WebViews. Please use Email Sign-In or open in system browser.',
            };
          }
        }
        throw popupErr;
      }
    }

    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    
    // Auto-fallback to redirect if popup is blocked
    if (err.code === 'auth/popup-blocked') {
      try {
        console.warn('Popup blocked, attempting signInWithRedirect...');
        await signInWithRedirect(auth, googleProvider);
        return { success: true, redirecting: true };
      } catch (redirectErr: any) {
        return { success: false, error: parseAuthError(redirectErr, currentHostname) };
      }
    }

    return { success: false, error: parseAuthError(err, currentHostname) };
  }
};

// Helper for user-friendly diagnostic error messages
const parseAuthError = (err: any, currentHostname: string): string => {
  const code = err.code || '';
  const message = err.message || '';

  if (code === 'auth/popup-closed-by-user') {
    return 'Sign-in popup was closed before completing.';
  }
  if (code === 'auth/unauthorized-domain') {
    return `Domain "${currentHostname}" is not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains. Please add "${currentHostname}" to the list.`;
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google provider is disabled. Please enable Google under Firebase Console -> Authentication -> Sign-in method.';
  }
  if (code === 'auth/invalid-api-key' || message.includes('API key') || message.includes('api-key-not-valid')) {
    return 'Invalid Firebase API Key. Please verify your VITE_FIREBASE_API_KEY in .env file.';
  }
  if (code === 'auth/disallowed-useragent' || message.includes('useragent')) {
    return 'Google OAuth restricts popup sign-ins inside embedded WebViews. Use Email login or Redirect sign-in.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network request failed. Please check your internet connection.';
  }
  
  return message || 'Failed to sign in with Google.';
};

// Email/Password Login
export const loginWithEmail = async (email: string, pass: string): Promise<AuthResult> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return { success: true, user: result.user };
  } catch (err: any) {
    console.error('Email Login Error:', err);
    let errorMessage = err.message || 'Failed to sign in.';
    if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password.';
    } else if (err.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    return { success: false, error: errorMessage };
  }
};

// Email/Password Registration
export const registerWithEmail = async (email: string, pass: string, name: string): Promise<AuthResult> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user && name.trim()) {
      await updateFirebaseProfile(result.user, { displayName: name });
    }
    return { success: true, user: result.user };
  } catch (err: any) {
    console.error('Registration Error:', err);
    let errorMessage = err.message || 'Failed to create account.';
    if (err.code === 'auth/email-already-in-use') {
      errorMessage = 'This email address is already in use.';
    } else if (err.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters long.';
    }
    return { success: false, error: errorMessage };
  }
};

// Password Reset
export const resetPassword = async (email: string): Promise<AuthResult> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (err: any) {
    console.error('Password Reset Error:', err);
    let errorMessage = err.message || 'Failed to send password reset email.';
    if (err.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email address.';
    } else if (err.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }
    return { success: false, error: errorMessage };
  }
};

// Sign Out
export const logoutFirebase = async (): Promise<AuthResult> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err: any) {
    console.error('Sign Out Error:', err);
    return { success: false, error: err.message };
  }
};

// Auth Listener setup & redirect processing
export const initAuthListener = (onUserChange?: (user: User | null) => void) => {
  // Process any pending Google Redirect Sign-In results
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        console.log('Successfully signed in via Google Redirect:', result.user.email);
      }
    })
    .catch((err) => {
      console.error('Error handling redirect sign-in result:', err);
    });

  return onAuthStateChanged(auth, (user) => {
    const { profile, updateProfile, updateSettings } = useAppStore.getState();
    if (user) {
      const activePhotoURL = profile.photoURL || user.photoURL || undefined;
      const activeName = profile.name || user.displayName || user.email?.split('@')[0] || 'User';
      updateProfile({
        uid: user.uid,
        email: user.email || profile.email || '',
        name: activeName,
        photoURL: activePhotoURL,
      });
      updateSettings({ firebaseConnected: true });
    } else {
      updateSettings({ firebaseConnected: false });
    }
    if (onUserChange) onUserChange(user);
  });
};
