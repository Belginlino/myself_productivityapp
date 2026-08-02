import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User,
} from 'firebase/auth';
import { auth } from './config';
import { useAppStore } from '../store/useAppStore';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Google Sign In
export const loginWithGoogle = async (): Promise<AuthResult> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    let errorMessage = err.message || 'Google sign-in failed.';
    if (err.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in window was closed.';
    } else if (err.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google sign-in is not enabled in Firebase Console.';
    }
    return { success: false, error: errorMessage };
  }
};

// Guest / Anonymous Sign In
export const loginAsGuest = async (): Promise<AuthResult> => {
  try {
    const result = await signInAnonymously(auth);
    return { success: true, user: result.user };
  } catch (err: any) {
    console.error('Guest Sign-In Error:', err);
    let errorMessage = err.message || 'Guest sign-in failed.';
    if (err.code === 'auth/operation-not-allowed') {
      errorMessage = 'Anonymous sign-in is not enabled in Firebase Console.';
    }
    return { success: false, error: errorMessage };
  }
};

// Toggle Session Persistence
export const updateSessionPersistence = async (remember: boolean): Promise<boolean> => {
  try {
    const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
    return true;
  } catch (err) {
    console.error('Persistence error:', err);
    return false;
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
    if (
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential'
    ) {
      errorMessage = 'Invalid email or password.';
    } else if (err.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    return { success: false, error: errorMessage };
  }
};

// Email/Password Registration
export const registerWithEmail = async (
  email: string,
  pass: string,
  name: string
): Promise<AuthResult> => {
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

// Auth Listener setup
export const initAuthListener = (onUserChange?: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    const { profile, updateProfile, updateSettings } = useAppStore.getState();
    if (user) {
      const activeName =
        profile.name || user.displayName || (user.isAnonymous ? 'Guest User' : user.email?.split('@')[0]) || 'User';
      updateProfile({
        uid: user.uid,
        email: user.email || profile.email || (user.isAnonymous ? 'guest@myself.local' : ''),
        name: activeName,
        photoURL: profile.photoURL || user.photoURL || undefined,
      });
      updateSettings({ firebaseConnected: true });
    } else {
      updateSettings({ firebaseConnected: false });
    }
    if (onUserChange) onUserChange(user);
  });
};
