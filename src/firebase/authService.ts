import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
}

// Google Sign-In
export const loginWithGoogle = async (): Promise<AuthResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    let errorMessage = err.message || 'Failed to sign in with Google.';
    if (err.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in popup was closed before completing.';
    } else if (err.code === 'auth/unauthorized-domain') {
      errorMessage = 'Domain not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.';
    }
    return { success: false, error: errorMessage };
  }
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

// Auth Listener setup
export const initAuthListener = (onUserChange?: (user: User | null) => void) => {
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
