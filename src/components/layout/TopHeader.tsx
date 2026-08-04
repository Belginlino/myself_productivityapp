import React, { useState } from 'react';
import { Plus, Moon, Sun, Bell, Flame, Check, Cloud, Mail, Mic, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { FirebaseAuthModal } from '../common/FirebaseAuthModal';
import { VoicePermissionModal } from '../common/VoicePermissionModal';

export const TopHeader: React.FC = () => {
  const {
    profile,
    settings,
    setTheme,
    toggleQuickAdd,
    toggleSettings,
    notifications,
    unreadNotificationCount,
    markNotificationsAsRead,
  } = useAppStore();

  const { streakData } = useRoutineStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVoicePermissionOpen, setIsVoicePermissionOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 transition-colors">
      {/* Left: App Logo & Name */}
      <div className="flex items-center gap-2 shrink-0">
        <img src="/favicon.svg" alt="Myself Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shadow-md" />
        <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
          Myself
        </span>
      </div>

      {/* Right: Actions & Controls */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 overflow-x-auto no-scrollbar">
        {/* Streak Counter (Tablet/Desktop) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black">
          <Flame className="w-4 h-4 fill-amber-500" />
          <span>{streakData.currentStreak} Day Streak</span>
        </div>

        {/* Voice Permission Trigger (Tablet/Desktop) */}
        <button
          onClick={() => setIsVoicePermissionOpen(true)}
          className="hidden sm:block p-2 rounded-full text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          title="Voice Permissions"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Firebase Cloud Sync Button */}
        {settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1' ? (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/15 hover:bg-slate-200 dark:hover:bg-white/20 text-xs font-extrabold transition-all"
            title="Cloud Synced"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline truncate max-w-[90px]">
              {profile.name || 'Synced'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1"
            title="Sign in with Email"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 sm:p-2 rounded-full text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-3xl shadow-2xl z-50 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Notifications</h4>
                <button
                  onClick={() => {
                    markNotificationsAsRead();
                    setShowNotifications(false);
                  }}
                  className="text-xs text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-bold"
                >
                  <Check className="w-3.5 h-3.5" /> Mark read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-white/10 mt-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-neutral-400 text-center py-5">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-3 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Pill */}
        <div className="flex items-center bg-slate-100 dark:bg-white/10 p-0.5 sm:p-1 rounded-full border border-slate-200/80 dark:border-white/15 backdrop-blur-md">
          <button
            onClick={() => setTheme('light')}
            className={`p-1 sm:p-1.5 rounded-full transition-colors ${
              settings.theme === 'light'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1 sm:p-1.5 rounded-full transition-colors ${
              settings.theme === 'dark'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Always Visible Settings Button */}
        <button
          onClick={() => toggleSettings(true)}
          className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all border border-slate-200/80 dark:border-white/15 shrink-0"
          title="Open Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Quick Add Button (Tablet/Desktop) */}
        <button
          onClick={() => toggleQuickAdd(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-200 text-white dark:text-slate-950 text-xs font-extrabold shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Quick Add
        </button>
      </div>

      <FirebaseAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <VoicePermissionModal
        isOpen={isVoicePermissionOpen}
        onClose={() => setIsVoicePermissionOpen(false)}
      />
    </header>
  );
};
