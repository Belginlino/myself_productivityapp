import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Cloud,
  LogOut,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  DownloadCloud,
  Lock,
  Mail,
  User,
  Shield,
  HelpCircle,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from './Button';
import { useAppStore } from '../../store/useAppStore';
import {
  loginWithEmail,
  registerWithEmail,
  resetPassword,
  logoutFirebase,
  loginWithGoogle,
  loginAsGuest,
} from '../../firebase/authService';
import { pushAllDataToCloud, pullAllDataFromCloud } from '../../firebase/syncService';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const { profile, settings } = useAppStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStatusMsg(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isConnected = settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setStatusMsg(null);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success && res.user) {
      setStatusMsg({ type: 'success', text: `Signed in as ${res.user.displayName || res.user.email}!` });
      await pullAllDataFromCloud(res.user.uid);
      setTimeout(() => onClose(), 1200);
    } else if (res.error) {
      setStatusMsg({ type: 'error', text: res.error });
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setStatusMsg(null);
    const res = await loginAsGuest();
    setLoading(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Signed in as Guest User.' });
      setTimeout(() => onClose(), 1200);
    } else if (res.error) {
      setStatusMsg({ type: 'error', text: res.error });
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setStatusMsg(null);
    const res = await loginWithEmail(email, password);
    setLoading(false);
    if (res.success && res.user) {
      setStatusMsg({ type: 'success', text: `Welcome back, ${res.user.email}!` });
      await pullAllDataFromCloud(res.user.uid);
      setTimeout(() => onClose(), 1200);
    } else if (res.error) {
      setStatusMsg({ type: 'error', text: res.error });
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setStatusMsg(null);
    const res = await registerWithEmail(email, password, displayName);
    setLoading(false);
    if (res.success && res.user) {
      setStatusMsg({ type: 'success', text: `Account created for ${res.user.email}!` });
      await pushAllDataToCloud(res.user.uid);
      setTimeout(() => onClose(), 1200);
    } else if (res.error) {
      setStatusMsg({ type: 'error', text: res.error });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setStatusMsg({ type: 'error', text: 'Please enter your email address first.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    const res = await resetPassword(email);
    setLoading(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: `Password reset email sent to ${email}!` });
    } else if (res.error) {
      setStatusMsg({ type: 'error', text: res.error });
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await logoutFirebase();
    setLoading(false);
    setStatusMsg({ type: 'success', text: 'Signed out of Firebase Cloud.' });
  };

  const handlePushCloud = async () => {
    if (!profile.uid) return;
    setLoading(true);
    setStatusMsg(null);
    const res = await pushAllDataToCloud(profile.uid);
    setLoading(false);
    setStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const handlePullCloud = async () => {
    if (!profile.uid) return;
    setLoading(true);
    setStatusMsg(null);
    const res = await pullAllDataFromCloud(profile.uid);
    setLoading(false);
    setStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-lg my-auto bg-white/95 dark:bg-[rgba(18,18,18,0.85)] backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-5 sm:p-7">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              Cloud Sync & Auth
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Sign in with Email to sync your tasks, daily routines, and streaks.
            </p>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMsg && (
          <div
            className={`p-4 mb-5 rounded-2xl text-xs font-semibold flex items-center gap-3 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Logged In View */}
        {isConnected ? (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-black text-sm flex items-center justify-center shrink-0">
                {(profile.name || profile.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {profile.name || 'User'}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-white/15 text-slate-900 dark:text-white text-[10px] font-black border border-slate-300 dark:border-white/20">
                    SYNCED
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">{profile.email}</p>
              </div>
            </div>

            {/* Cloud Operations */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="primary"
                disabled={loading}
                icon={<UploadCloud className="w-4 h-4" />}
                onClick={handlePushCloud}
                className="w-full text-xs justify-center py-2.5"
              >
                Push Local to Cloud
              </Button>
              <Button
                variant="secondary"
                disabled={loading}
                icon={<DownloadCloud className="w-4 h-4" />}
                onClick={handlePullCloud}
                className="w-full text-xs justify-center py-2.5"
              >
                Pull from Cloud
              </Button>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-xs text-slate-600 dark:text-neutral-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Setup info
              </button>
              <Button
                variant="danger"
                disabled={loading}
                icon={<LogOut className="w-3.5 h-3.5" />}
                onClick={handleLogout}
                className="text-xs px-4 py-2"
              >
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          /* Email Sign In / Registration Form */
          <div className="space-y-5">
            {/* Tab Switcher */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-white/10 rounded-full border border-slate-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                  activeTab === 'login'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Email Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                  activeTab === 'register'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {activeTab === 'login' ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-neutral-400" />
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPassword((prev) => !prev);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors focus:outline-none flex items-center justify-center cursor-pointer select-none z-10"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="primary" disabled={loading} className="w-full text-xs py-3 justify-center mt-2">
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleEmailRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                    Your Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPassword((prev) => !prev);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors focus:outline-none flex items-center justify-center cursor-pointer select-none z-10"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="primary" disabled={loading} className="w-full text-xs py-3 justify-center mt-2">
                  {loading ? 'Creating Account...' : 'Register & Sync'}
                </Button>
              </form>
            )}

            <div className="pt-2">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-xs text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-semibold mx-auto"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Firebase setup guide
              </button>
            </div>
          </div>
        )}

        {/* Setup Help Accordion */}
        {showHelp && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] text-slate-800 dark:text-neutral-300 space-y-2 animate-fadeIn">
            <p className="font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> Firebase Setup Checklist:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-neutral-400 leading-relaxed">
              <li>
                Open{' '}
                <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-slate-900 dark:text-white">
                  Firebase Console
                </a>
              </li>
              <li>Enable Email/Password under Authentication -&gt; Sign-in method.</li>
              <li>Deploy <code className="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono">firestore.rules</code> via CLI: <code className="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono">firebase deploy --only firestore:rules</code></li>
            </ol>
          </div>
        )}
      </div>
    </div>
  </div>,
  document.body
);
};
