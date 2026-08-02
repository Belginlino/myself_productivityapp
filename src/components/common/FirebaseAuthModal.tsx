import React, { useState, useEffect } from 'react';
import {
  Cloud,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
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
  KeyRound,
} from 'lucide-react';
import { Button } from './Button';
import { useAppStore } from '../../store/useAppStore';
import { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logoutFirebase } from '../../firebase/authService';
import { pushAllDataToCloud, pullAllDataFromCloud } from '../../firebase/syncService';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
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
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isConnected = settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1';

  const handleGoogleSignIn = async (useRedirect: boolean = false) => {
    setLoading(true);
    setStatusMsg(null);
    const res = await loginWithGoogle({ useRedirect });
    setLoading(false);
    if (res.redirecting) {
      setStatusMsg({ type: 'success', text: 'Redirecting to Google for authentication...' });
    } else if (res.success && res.user) {
      setStatusMsg({ type: 'success', text: `Signed in as ${res.user.email || res.user.displayName}!` });
      // Automatically push data or pull data after login
      await pullAllDataFromCloud(res.user.uid);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 amoled:bg-amoled-card border border-slate-200 dark:border-slate-800 amoled:border-amoled-border rounded-3xl shadow-2xl overflow-hidden p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Firebase Cloud Sync
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to sync your tasks, daily routines, and streaks across all your devices.
            </p>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMsg && (
          <div
            className={`p-3.5 mb-5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
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
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-12 h-12 rounded-full ring-2 ring-indigo-500" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                  {(profile.name || profile.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {profile.name || 'Firebase User'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                    CONNECTED
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.email}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">UID: {profile.uid}</p>
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
                Sync Local to Cloud
              </Button>
              <Button
                variant="outline"
                disabled={loading}
                icon={<DownloadCloud className="w-4 h-4" />}
                onClick={handlePullCloud}
                className="w-full text-xs justify-center py-2.5"
              >
                Pull from Cloud
              </Button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Setup details
              </button>
              <Button
                variant="outline"
                disabled={loading}
                icon={<LogOut className="w-3.5 h-3.5" />}
                onClick={handleLogout}
                className="text-xs border-slate-300 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          /* Sign In / Register Forms */
          <div className="space-y-4">
            {/* Quick Google Sign In (Popup & Redirect options) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleGoogleSignIn(false)}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
                title="Sign in via Popup Window"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{loading ? 'Connecting...' : 'Google Popup'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSignIn(true)}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
                title="Sign in via Redirect (Best for Mobile & Popup Blockers)"
              >
                <span>{loading ? 'Redirecting...' : 'Google Redirect'}</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                or email
              </span>
            </div>

            {/* Email Login / Register Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                Create Account
              </button>
            </div>

            {activeTab === 'login' ? (
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="primary" disabled={loading} className="w-full text-xs py-2.5 justify-center mt-2">
                  {loading ? 'Signing In...' : 'Sign In with Email'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleEmailRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="primary" disabled={loading} className="w-full text-xs py-2.5 justify-center mt-2">
                  {loading ? 'Creating Account...' : 'Register & Sync'}
                </Button>
              </form>
            )}

            <div className="pt-2">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 font-medium mx-auto"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Troubleshooting & Setup Instructions
              </button>
            </div>
          </div>
        )}

        {/* Setup Help Accordion */}
        {showHelp && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 space-y-2 animate-fadeIn">
            <p className="font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Firebase Setup Checklist:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-amber-800 dark:text-amber-300 leading-relaxed">
              <li>
                Open{' '}
                <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold">
                  Firebase Console
                </a>
              </li>
              <li>Enable Email/Password and Google in Authentication -&gt; Sign-in method.</li>
              <li>
                Add your current domain (<code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded font-mono">{typeof window !== 'undefined' ? window.location.hostname : 'localhost'}</code>) under Authentication -&gt; Settings -&gt; Authorized domains.
              </li>
              <li>Deploy <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded">firestore.rules</code> using Firebase CLI: <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded">firebase deploy --only firestore:rules</code></li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
