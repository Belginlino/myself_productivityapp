import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  KeyRound,
  Shield,
  Sun,
  Moon,
  Bell,
  Volume2,
  Vibrate,
  Cloud,
  Mail,
  UserCheck,
  Lock,
  Unlock,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  LogOut,
  Check,
  Laptop,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { PreferredLoginMethod } from '../../types';
import {
  loginWithGoogle,
  loginAsGuest,
  updateSessionPersistence,
  logoutFirebase,
} from '../../firebase/authService';
import { pushAllDataToCloud, pullAllDataFromCloud } from '../../firebase/syncService';
import { FirebaseAuthModal } from './FirebaseAuthModal';

export const SettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    profile,
    isSettingsOpen,
    toggleSettings,
    setPinCode,
    togglePinLock,
    lockApp,
    setTheme,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'login' | 'appearance' | 'notifications' | 'account'>('login');
  const [pinInput, setPinInput] = useState(settings.pinCode || '');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (!isSettingsOpen) return null;

  const isConnected = settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1';

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccessMsg('');
    if (!/^\d{4}$/.test(pinInput)) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }
    setPinCode(pinInput);
    togglePinLock(true);
    setPinSuccessMsg('4-Digit Passcode enabled successfully!');
  };

  const handleDisablePin = () => {
    togglePinLock(false);
    setPinInput('');
    setPinCode('');
    setPinSuccessMsg('Passcode lock disabled.');
  };

  const handleGoogleSignIn = async () => {
    setActionLoading(true);
    setStatusMsg(null);
    const res = await loginWithGoogle();
    setActionLoading(false);
    if (res.success && res.user) {
      setStatusMsg({ type: 'success', text: `Signed in with Google as ${res.user.displayName || res.user.email}!` });
      if (settings.autoSyncOnLogin) {
        await pullAllDataFromCloud(res.user.uid);
      }
    } else if (res.error) {
      setStatusMsg({ type: 'error', text: res.error });
    }
  };

  const handleGuestSignIn = async () => {
    setActionLoading(true);
    setStatusMsg(null);
    const res = await loginAsGuest();
    setActionLoading(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Signed in as Guest User.' });
    } else if (res.error) {
      setStatusMsg({ type: 'error', text: res.error });
    }
  };

  const handleToggleRememberMe = async (val: boolean) => {
    updateSettings({ rememberMe: val });
    await updateSessionPersistence(val);
  };

  const handlePushCloud = async () => {
    if (!profile.uid) return;
    setActionLoading(true);
    setStatusMsg(null);
    const res = await pushAllDataToCloud(profile.uid);
    setActionLoading(false);
    setStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const handlePullCloud = async () => {
    if (!profile.uid) return;
    setActionLoading(true);
    setStatusMsg(null);
    const res = await pullAllDataFromCloud(profile.uid);
    setActionLoading(false);
    setStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const handleLogout = async () => {
    setActionLoading(true);
    await logoutFirebase();
    setActionLoading(false);
    setStatusMsg({ type: 'success', text: 'Logged out successfully.' });
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-2xl bg-white/95 dark:bg-[rgba(18,18,18,0.9)] backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold shadow-md">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Application Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Manage login options, security, theme, and cloud preferences
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSettings(false)}
              className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex px-6 pt-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] overflow-x-auto gap-2">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'login'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Login & Security</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'appearance'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'account'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Cloud & Account</span>
            </button>
          </div>

          {/* Status Message Notification */}
          {statusMsg && (
            <div
              className={`mx-6 mt-4 p-3 rounded-2xl text-xs font-semibold flex items-center justify-between ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              <span>{statusMsg.text}</span>
              <button onClick={() => setStatusMsg(null)} className="text-xs font-bold underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Tab Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* 🔑 LOGIN & SECURITY TAB */}
            {activeTab === 'login' && (
              <div className="space-y-6">
                {/* Section: Preferred Login Method */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Preferred Login Method
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      Standard application email authentication active.
                    </p>
                  </div>

                  <div className="pt-1">
                    <div className="p-3 w-48 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black border border-slate-900 dark:border-white shadow-md text-xs font-bold flex items-center justify-center gap-2">
                      <Mail className="w-5 h-5" />
                      <span>Email Authentication</span>
                    </div>
                  </div>
                </div>

                {/* Section: Quick Auth Options */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Authentication Options
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      Sign in or create account with your email.
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-neutral-200 transition-all shadow-sm"
                    >
                      <Mail className="w-4 h-4" /> Email Login / Register
                    </button>
                  </div>
                </div>

                {/* Section: Login Toggles (Auto-Sync & Remember Me) */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Auto-Sync on Login</h4>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Automatically pull and synchronize cloud data right after signing in.
                      </p>
                    </div>
                    <button
                      onClick={() => updateSettings({ autoSyncOnLogin: !settings.autoSyncOnLogin })}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        settings.autoSyncOnLogin ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform ${
                          settings.autoSyncOnLogin
                            ? 'translate-x-6 bg-white dark:bg-black'
                            : 'translate-x-0 bg-slate-500 dark:bg-neutral-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-white/10 pt-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Remember Me / Stay Signed In</h4>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Persist session across browser restarts.
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleRememberMe(!settings.rememberMe)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        settings.rememberMe ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform ${
                          settings.rememberMe
                            ? 'translate-x-6 bg-white dark:bg-black'
                            : 'translate-x-0 bg-slate-500 dark:bg-neutral-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Section: App Passcode Security Lock */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-slate-900 dark:text-white" /> Passcode Lock (4-Digit PIN)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Require a 4-digit PIN when launching or unlocking the application.
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        settings.pinLockEnabled
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-neutral-400'
                      }`}
                    >
                      {settings.pinLockEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <form onSubmit={handleSavePin} className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-white/10">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300">
                      {settings.pinLockEnabled ? 'Update 4-Digit Passcode' : 'Set New 4-Digit Passcode'}
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center">
                        <input
                          type={showPin ? 'text' : 'password'}
                          maxLength={4}
                          placeholder="••••"
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                          className="w-32 pl-4 pr-9 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-center text-sm font-mono text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowPin((prev) => !prev);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors focus:outline-none z-10"
                          title={showPin ? 'Hide Passcode' : 'Show Passcode'}
                        >
                          {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
                      >
                        {settings.pinLockEnabled ? 'Update PIN' : 'Enable Passcode'}
                      </button>
                      {settings.pinLockEnabled && (
                        <button
                          type="button"
                          onClick={handleDisablePin}
                          className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs border border-red-200 dark:border-red-800/40 hover:bg-red-100 transition-colors"
                        >
                          Disable Lock
                        </button>
                      )}
                    </div>

                    {pinError && <p className="text-xs text-red-500 font-semibold">{pinError}</p>}
                    {pinSuccessMsg && <p className="text-xs text-emerald-500 font-semibold">{pinSuccessMsg}</p>}
                  </form>

                  {settings.pinLockEnabled && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          lockApp();
                          toggleSettings(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold text-xs shadow-md active:scale-98 transition-transform"
                      >
                        <Lock className="w-4 h-4" /> Lock App Right Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 🎨 APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                    Theme Preference
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all ${
                        settings.theme === 'light'
                          ? 'border-slate-900 ring-2 ring-slate-900 dark:border-white dark:ring-white bg-slate-100'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-sm">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">Light Mode</p>
                        <p className="text-[10px] text-slate-500">Clean, crisp light appearance</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all ${
                        settings.theme === 'dark'
                          ? 'border-slate-900 ring-2 ring-slate-900 dark:border-white dark:ring-white bg-slate-900 text-white'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">Dark Mode</p>
                        <p className="text-[10px] text-neutral-400">Sleek, obsidian dark mode</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 🔔 NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-slate-900 dark:text-white" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">System Notifications</h4>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                          Receive task reminders and daily routine updates.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        settings.notificationsEnabled ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform ${
                          settings.notificationsEnabled
                            ? 'translate-x-6 bg-white dark:bg-black'
                            : 'translate-x-0 bg-slate-500 dark:bg-neutral-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-white/10 pt-4">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-slate-900 dark:text-white" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reminder Sound</h4>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                          Play an audio chime when notifications trigger.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings({ reminderSound: !settings.reminderSound })}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        settings.reminderSound ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform ${
                          settings.reminderSound
                            ? 'translate-x-6 bg-white dark:bg-black'
                            : 'translate-x-0 bg-slate-500 dark:bg-neutral-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-white/10 pt-4">
                    <div className="flex items-center gap-3">
                      <Vibrate className="w-5 h-5 text-slate-900 dark:text-white" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Vibration Alert</h4>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                          Haptic feedback on mobile devices.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings({ vibration: !settings.vibration })}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        settings.vibration ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform ${
                          settings.vibration
                            ? 'translate-x-6 bg-white dark:bg-black'
                            : 'translate-x-0 bg-slate-500 dark:bg-neutral-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ☁️ CLOUD & ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div className="space-y-5">
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                        {(profile.name || profile.email || 'U')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {profile.name || 'Cloud User'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black">
                            SYNCED
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">{profile.email}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">UID: {profile.uid}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handlePushCloud}
                        disabled={actionLoading}
                        className="px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-neutral-200 transition-all disabled:opacity-50"
                      >
                        <UploadCloud className="w-4 h-4" /> Push Local to Cloud
                      </button>
                      <button
                        onClick={handlePullCloud}
                        disabled={actionLoading}
                        className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                      >
                        <DownloadCloud className="w-4 h-4" /> Pull from Cloud
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-white/10">
                      <button
                        onClick={handleLogout}
                        disabled={actionLoading}
                        className="w-full px-4 py-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out of Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-center space-y-4">
                    <Cloud className="w-10 h-10 mx-auto text-slate-400 dark:text-neutral-500" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Cloud Sync Disconnected</h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
                        Connect with Email or Google to sync your tasks and habits across all your devices.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black font-extrabold text-xs shadow-md active:scale-95 transition-transform"
                    >
                      Connect Account Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <FirebaseAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>,
    document.body
  );
};
