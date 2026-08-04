import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Lock,
  UploadCloud,
  DownloadCloud,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
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

  const tabs = [
    { id: 'login', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'account', label: 'Cloud', icon: Cloud },
  ];

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-white dark:bg-[#0e0e11] backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                  Application Settings
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium truncate">
                  Security, theme, notifications & cloud
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleSettings(false)}
              className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex px-4 pt-3 pb-2 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] overflow-x-auto no-scrollbar gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="settingsActiveTab"
                      className="absolute inset-0 bg-white dark:bg-white/10 rounded-2xl border border-slate-200 dark:border-white/15 shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`relative z-10 w-4 h-4 ${isActive ? 'text-indigo-500 dark:text-white' : ''}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Message Notification */}
          {statusMsg && (
            <div
              className={`mx-4 sm:mx-6 mt-4 p-3 rounded-2xl text-xs font-bold flex items-center justify-between ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/20'
              }`}
            >
              <span>{statusMsg.text}</span>
              <button onClick={() => setStatusMsg(null)} className="text-xs font-black underline ml-2">
                Dismiss
              </button>
            </div>
          )}

          {/* Tab Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {/* 🔑 LOGIN & SECURITY TAB */}
            {activeTab === 'login' && (
              <div className="space-y-4">
                {/* Section: Preferred Login Method */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/15 space-y-3 shadow-sm">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Preferred Login Method
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Standard application email authentication active.
                    </p>
                  </div>

                  <div className="pt-1">
                    <div className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-extrabold text-xs inline-flex items-center gap-2 shadow-md">
                      <Mail className="w-4 h-4" />
                      <span>Email Authentication</span>
                    </div>
                  </div>
                </div>

                {/* Section: Quick Auth Options */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/15 space-y-3 shadow-sm">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Authentication Options
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Sign in or create account with your email.
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-md"
                    >
                      <Mail className="w-4 h-4" /> Email Login / Register
                    </button>
                  </div>
                </div>

                {/* Section: Login Toggles */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/15 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Auto-Sync on Login</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Pull and sync cloud data right after signing in.
                      </p>
                    </div>
                    <button
                      onClick={() => updateSettings({ autoSyncOnLogin: !settings.autoSyncOnLogin })}
                      className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 ${
                        settings.autoSyncOnLogin ? 'bg-indigo-600 dark:bg-white' : 'bg-slate-300 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform ${
                          settings.autoSyncOnLogin
                            ? 'translate-x-5 bg-white dark:bg-slate-950'
                            : 'translate-x-0 bg-slate-500 dark:bg-neutral-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 dark:border-white/10 pt-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Stay Signed In</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Persist session across app restarts.
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleRememberMe(!settings.rememberMe)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 ${
                        settings.rememberMe ? 'bg-indigo-600 dark:bg-white' : 'bg-slate-300 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform ${
                          settings.rememberMe
                            ? 'translate-x-5 bg-white dark:bg-slate-950'
                            : 'translate-x-0 bg-slate-500 dark:bg-neutral-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Section: Passcode Security */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/15 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-indigo-500" /> Passcode Lock (4-Digit PIN)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Require a 4-digit PIN code when unlocking the app.
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        settings.pinLockEnabled
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-neutral-400'
                      }`}
                    >
                      {settings.pinLockEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <form onSubmit={handleSavePin} className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-white/10">
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      {settings.pinLockEnabled ? 'Update 4-Digit Passcode' : 'Set New 4-Digit Passcode'}
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative flex items-center">
                        <input
                          type={showPin ? 'text' : 'password'}
                          maxLength={4}
                          placeholder="••••"
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                          className="w-32 pl-4 pr-9 py-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 text-center text-sm font-mono text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowPin((prev) => !prev);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-10"
                          title={showPin ? 'Hide Passcode' : 'Show Passcode'}
                        >
                          {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs shadow-md hover:scale-[1.01] active:scale-95 transition-all"
                      >
                        {settings.pinLockEnabled ? 'Update PIN' : 'Enable Passcode'}
                      </button>
                      {settings.pinLockEnabled && (
                        <button
                          type="button"
                          onClick={handleDisablePin}
                          className="px-3.5 py-2.5 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold text-xs border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                          Disable Lock
                        </button>
                      )}
                    </div>

                    {pinError && <p className="text-xs text-red-500 font-bold">{pinError}</p>}
                    {pinSuccessMsg && <p className="text-xs text-emerald-500 font-bold">{pinSuccessMsg}</p>}
                  </form>

                  {settings.pinLockEnabled && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          lockApp();
                          toggleSettings(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs shadow-md active:scale-98 transition-transform"
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
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                    Theme Preference
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-5 rounded-3xl border text-left flex flex-col gap-3 transition-all ${
                        settings.theme === 'light'
                          ? 'border-slate-900 ring-2 ring-slate-900 dark:border-white dark:ring-white bg-slate-100'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-md">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-xs text-slate-900">Light Mode</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Clean, crisp light appearance</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-5 rounded-3xl border text-left flex flex-col gap-3 transition-all ${
                        settings.theme === 'dark'
                          ? 'border-slate-900 ring-2 ring-slate-900 dark:border-white dark:ring-white bg-slate-900 text-white'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-xs text-white">Dark Mode</p>
                        <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Sleek obsidian dark mode</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 🔔 NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/15 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-indigo-500" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">System Notifications</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          Task deadline reminders and daily habit alerts.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                      className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 ${
                        settings.notificationsEnabled ? 'bg-indigo-600 dark:bg-white' : 'bg-slate-300 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform ${
                          settings.notificationsEnabled
                            ? 'translate-x-5 bg-white dark:bg-slate-950'
                            : 'translate-x-0 bg-slate-500 dark:bg-neutral-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 dark:border-white/10 pt-4">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-indigo-500" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Reminder Sound</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          Play an audio chime when alarms trigger.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings({ reminderSound: !settings.reminderSound })}
                      className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 ${
                        settings.reminderSound ? 'bg-indigo-600 dark:bg-white' : 'bg-slate-300 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform ${
                          settings.reminderSound
                            ? 'translate-x-5 bg-white dark:bg-slate-950'
                            : 'translate-x-0 bg-slate-500 dark:bg-neutral-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 dark:border-white/10 pt-4">
                    <div className="flex items-center gap-3">
                      <Vibrate className="w-5 h-5 text-indigo-500" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Vibration Alert</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          Haptic vibration on mobile devices.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings({ vibration: !settings.vibration })}
                      className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 ${
                        settings.vibration ? 'bg-indigo-600 dark:bg-white' : 'bg-slate-300 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform ${
                          settings.vibration
                            ? 'translate-x-5 bg-white dark:bg-slate-950'
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
                    <div className="p-4 sm:p-5 rounded-3xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/15 flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                        {(profile.name || profile.email || 'U')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {profile.name || 'Cloud User'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
                            SYNCED
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{profile.email}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">UID: {profile.uid}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handlePushCloud}
                        disabled={actionLoading}
                        className="px-4 py-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                      >
                        <UploadCloud className="w-4 h-4" /> Push Cloud
                      </button>
                      <button
                        onClick={handlePullCloud}
                        disabled={actionLoading}
                        className="px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                      >
                        <DownloadCloud className="w-4 h-4" /> Pull Cloud
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-white/10">
                      <button
                        onClick={handleLogout}
                        disabled={actionLoading}
                        className="w-full px-4 py-3 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out of Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/90 dark:border-white/15 text-center space-y-4 shadow-sm">
                    <Cloud className="w-10 h-10 mx-auto text-slate-400 dark:text-neutral-500" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Cloud Sync Disconnected</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-sm mx-auto leading-relaxed">
                        Connect with Email or Google to sync your tasks and habits across all your devices.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-6 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black text-xs shadow-md active:scale-95 transition-transform"
                    >
                      Connect Account Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <FirebaseAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </AnimatePresence>,
    document.body
  );
};
