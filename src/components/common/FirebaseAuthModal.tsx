import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Cloud,
  LogOut,
  Mail,
  User,
  Shield,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
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
      setStatusMsg({ type: 'success', text: 'Account created successfully!' });
      await pushAllDataToCloud(res.user.uid);
      setTimeout(() => onClose(), 1200);
    } else if (res.error) {
      setStatusMsg({ type: 'error', text: res.error });
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setStatusMsg({ type: 'error', text: 'Please enter your email address first.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    const res = await resetPassword(email);
    setLoading(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Password reset link sent to your email.' });
    } else if (res.error) {
      setStatusMsg({ type: 'error', text: res.error });
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#23324A] text-white border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C9F48A] text-[#1B2435] flex items-center justify-center font-extrabold shadow-glow-accent">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Firebase Account</h3>
              <p className="text-xs text-[#A8B3C7]">Cloud Backup & Multi-device Sync</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#A8B3C7] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Status Card */}
        {isConnected ? (
          <div className="p-4 rounded-2xl bg-[#1B2435] border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C9F48A] text-[#1B2435] font-extrabold flex items-center justify-center">
                {(profile.name || profile.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white truncate text-xs">{profile.name || 'Cloud User'}</p>
                <p className="text-[11px] text-[#A8B3C7] truncate">{profile.email}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                setLoading(true);
                await logoutFirebase();
                setLoading(false);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-[#FF5D73]/20 text-[#FF5D73] font-bold text-xs border border-[#FF5D73]/30 hover:bg-[#FF5D73]/30 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex p-1 bg-[#1B2435] rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'login' ? 'bg-[#C9F48A] text-[#1B2435] shadow-glow-accent' : 'text-[#A8B3C7]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'register' ? 'bg-[#C9F48A] text-[#1B2435] shadow-glow-accent' : 'text-[#A8B3C7]'
                }`}
              >
                Register
              </button>
            </div>

            {/* Notification Status Msg */}
            {statusMsg && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold ${
                  statusMsg.type === 'success'
                    ? 'bg-[#76E56A]/20 text-[#76E56A] border border-[#76E56A]/30'
                    : 'bg-[#FF5D73]/20 text-[#FF5D73] border border-[#FF5D73]/30'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            {/* Email Form */}
            <form
              onSubmit={activeTab === 'login' ? handleEmailLogin : handleEmailRegister}
              className="space-y-3.5"
            >
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-[#A8B3C7] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-[#1B2435] text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9F48A]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#A8B3C7] mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-[#1B2435] text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9F48A]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#A8B3C7]">Password</label>
                  {activeTab === 'login' && (
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-[11px] font-bold text-[#37C7F4] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-2xl border border-white/10 bg-[#1B2435] text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9F48A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8B3C7] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-bold text-xs shadow-glow-accent hover:bg-[#b1e06d] transition-all disabled:opacity-50 mt-2"
              >
                {loading
                  ? 'Processing...'
                  : activeTab === 'login'
                  ? 'Sign In with Email'
                  : 'Create Free Account'}
              </button>
            </form>

            <div className="relative py-1 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-3 bg-[#23324A] text-[11px] font-bold text-[#A8B3C7]">
                OR CONTINUE WITH
              </span>
            </div>

            {/* Google & Guest Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="py-3 px-4 rounded-2xl bg-[#1B2435] hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-4 h-4"
                />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={loading}
                className="py-3 px-4 rounded-2xl bg-[#1B2435] hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <User className="w-4 h-4 text-[#37C7F4]" />
                <span>Guest</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
