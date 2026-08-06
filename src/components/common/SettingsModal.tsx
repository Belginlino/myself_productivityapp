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
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'login' | 'notifications' | 'account'>('login');
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
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'account', label: 'Cloud', icon: Cloud },
  ];

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-[#23324A] text-white border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-[#C9F48A] text-[#1B2435] flex items-center justify-center font-extrabold shrink-0 shadow-glow-accent">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Application Settings
                </h2>
                <p className="text-[11px] text-[#A8B3C7] font-medium truncate">
                  Security, alerts & cloud sync
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleSettings(false)}
              className="p-2 rounded-full text-[#A8B3C7] hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex px-4 pt-3 pb-2 border-b border-white/10 bg-[#1B2435]/60 overflow-x-auto no-scrollbar gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive ? 'text-[#1B2435]' : 'text-[#A8B3C7] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="settingsActiveTab"
                      className="absolute inset-0 bg-[#C9F48A] rounded-2xl shadow-glow-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="relative z-10 w-4 h-4" />
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
                  ? 'bg-[#76E56A]/20 text-[#76E56A] border border-[#76E56A]/30'
                  : 'bg-[#FF5D73]/20 text-[#FF5D73] border border-[#FF5D73]/30'
              }`}
            >
              <span>{statusMsg.text}</span>
              <button onClick={() => setStatusMsg(null)} className="text-xs font-bold underline ml-2">
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
                <div className="p-4 sm:p-5 rounded-3xl bg-[#1B2435] border border-white/10 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#A8B3C7] uppercase tracking-wider">
                      Preferred Login Method
                    </h3>
                    <p className="text-[11px] text-white/70 font-medium mt-0.5">
                      Standard application email authentication active.
                    </p>
                  </div>

                  <div className="pt-1">
                    <div className="px-4 py-2.5 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-bold text-xs inline-flex items-center gap-2 shadow-glow-accent">
                      <Mail className="w-4 h-4" />
                      <span>Email Authentication</span>
                    </div>
                  </div>
                </div>

                {/* Section: Quick Auth Options */}
                <div className="p-4 sm:p-5 rounded-3xl bg-[#1B2435] border border-white/10 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#A8B3C7] uppercase tracking-wider">
                      Authentication Options
                    </h3>
                    <p className="text-[11px] text-white/70 font-medium mt-0.5">
                      Sign in or create account with your email.
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#b1e06d] transition-all shadow-glow-accent"
                    >
                      <Mail className="w-4 h-4" /> Email Login / Register
                    </button>
                  </div>
                </div>

                {/* Section: Login Toggles */}
                <div className="p-4 sm:p-5 rounded-3xl bg-[#1B2435] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white">Auto-Sync on Login</h4>
                      <p className="text-[11px] text-[#A8B3C7] font-medium mt-0.5">
                        Pull and sync cloud data right after signing in.
                      </p>
                    </div>
                    <button
                      onClick={() => updateSettings({ autoSyncOnLogin: !settings.autoSyncOnLogin })}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                        settings.autoSyncOnLogin ? 'bg-[#C9F48A]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-[#1B2435] transition-transform ${
                          settings.autoSyncOnLogin ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <div>
                      <h4 className="text-xs font-bold text-white">Stay Signed In</h4>
                      <p className="text-[11px] text-[#A8B3C7] font-medium mt-0.5">
                        Persist session across app restarts.
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleRememberMe(!settings.rememberMe)}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                        settings.rememberMe ? 'bg-[#C9F48A]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-[#1B2435] transition-transform ${
                          settings.rememberMe ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Section: Passcode Security */}
                <div className="p-4 sm:p-5 rounded-3xl bg-[#1B2435] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#37C7F4]" /> Passcode Lock (4-Digit PIN)
                      </h4>
                      <p className="text-[11px] text-[#A8B3C7] font-medium mt-0.5">
                        Require a 4-digit PIN code when unlocking the app.
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        settings.pinLockEnabled
                          ? 'bg-[#76E56A]/20 text-[#76E56A] border border-[#76E56A]/30'
                          : 'bg-white/10 text-[#A8B3C7]'
                      }`}
                    >
                      {settings.pinLockEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <form onSubmit={handleSavePin} className="space-y-3 pt-2 border-t border-white/10">
                    <label className="block text-[11px] font-bold text-[#A8B3C7]">
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
                          className="w-32 pl-4 pr-9 py-2.5 rounded-2xl border border-white/10 bg-[#23324A] text-center text-sm font-mono font-bold text-white tracking-widest focus:outline-none focus:border-[#C9F48A]"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowPin((prev) => !prev);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#A8B3C7] hover:text-white transition-colors z-10"
                          title={showPin ? 'Hide Passcode' : 'Show Passcode'}
                        >
                          {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-bold text-xs shadow-glow-accent hover:bg-[#b1e06d] transition-all"
                      >
                        {settings.pinLockEnabled ? 'Update PIN' : 'Enable Passcode'}
                      </button>
                      {settings.pinLockEnabled && (
                        <button
                          type="button"
                          onClick={handleDisablePin}
                          className="px-3.5 py-2.5 rounded-2xl bg-[#FF5D73]/20 text-[#FF5D73] font-bold text-xs border border-[#FF5D73]/30 hover:bg-[#FF5D73]/30 transition-colors"
                        >
                          Disable Lock
                        </button>
                      )}
                    </div>

                    {pinError && <p className="text-xs text-[#FF5D73] font-bold">{pinError}</p>}
                    {pinSuccessMsg && <p className="text-xs text-[#76E56A] font-bold">{pinSuccessMsg}</p>}
                  </form>

                  {settings.pinLockEnabled && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          lockApp();
                          toggleSettings(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#FF5D73] text-white font-bold text-xs shadow-md active:scale-98 transition-transform"
                      >
                        <Lock className="w-4 h-4" /> Lock App Right Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 🔔 NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-3xl bg-[#1B2435] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-[#37C7F4]" />
                      <div>
                        <h4 className="text-xs font-bold text-white">System Notifications</h4>
                        <p className="text-[11px] text-[#A8B3C7] font-medium mt-0.5">
                          Task deadline reminders and daily habit alerts.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                        settings.notificationsEnabled ? 'bg-[#C9F48A]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-[#1B2435] transition-transform ${
                          settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-[#37C7F4]" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Reminder Sound</h4>
                        <p className="text-[11px] text-[#A8B3C7] font-medium mt-0.5">
                          Play an audio chime when alarms trigger.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings({ reminderSound: !settings.reminderSound })}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                        settings.reminderSound ? 'bg-[#C9F48A]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-[#1B2435] transition-transform ${
                          settings.reminderSound ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-3">
                      <Vibrate className="w-5 h-5 text-[#37C7F4]" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Vibration Alert</h4>
                        <p className="text-[11px] text-[#A8B3C7] font-medium mt-0.5">
                          Haptic vibration on mobile devices.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings({ vibration: !settings.vibration })}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                        settings.vibration ? 'bg-[#C9F48A]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-[#1B2435] transition-transform ${
                          settings.vibration ? 'translate-x-6' : 'translate-x-0'
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
                    <div className="p-4 sm:p-5 rounded-3xl bg-[#1B2435] border border-white/10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#C9F48A] text-[#1B2435] font-extrabold text-sm flex items-center justify-center shrink-0 shadow-glow-accent">
                        {(profile.name || profile.email || 'U')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white truncate">
                            {profile.name || 'Cloud User'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-[#76E56A]/20 text-[#76E56A] border border-[#76E56A]/30 text-[10px] font-bold">
                            SYNCED
                          </span>
                        </div>
                        <p className="text-xs text-[#A8B3C7] font-medium truncate">{profile.email}</p>
                        <p className="text-[10px] text-white/50 font-mono truncate mt-0.5">UID: {profile.uid}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handlePushCloud}
                        disabled={actionLoading}
                        className="px-4 py-3.5 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-bold text-xs flex items-center justify-center gap-2 shadow-glow-accent hover:bg-[#b1e06d] transition-all disabled:opacity-50"
                      >
                        <UploadCloud className="w-4 h-4" /> Push Cloud
                      </button>
                      <button
                        onClick={handlePullCloud}
                        disabled={actionLoading}
                        className="px-4 py-3.5 rounded-2xl bg-white/10 text-white border border-white/10 font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/20 transition-all disabled:opacity-50"
                      >
                        <DownloadCloud className="w-4 h-4" /> Pull Cloud
                      </button>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        disabled={actionLoading}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FF5D73]/20 text-[#FF5D73] border border-[#FF5D73]/30 font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#FF5D73]/30 transition-all disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out of Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-[#1B2435] border border-white/10 text-center space-y-4">
                    <Cloud className="w-10 h-10 mx-auto text-[#37C7F4]" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Cloud Sync Disconnected</h4>
                      <p className="text-xs text-[#A8B3C7] font-medium mt-1 max-w-sm mx-auto leading-relaxed">
                        Connect with Email or Google to sync your tasks and habits across all your devices.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-bold text-xs shadow-glow-accent hover:bg-[#b1e06d] transition-transform"
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
