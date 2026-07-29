import React, { useState } from 'react';
import {
  Plus,
  Moon,
  Sun,
  Bell,
  Coins,
  Flame,
  Check,
  Sparkles,
  Cloud,
} from 'lucide-react';

import { useAppStore } from '../../store/useAppStore';
import { FirebaseAuthModal } from '../common/FirebaseAuthModal';
import { loginWithGoogle } from '../../firebase/authService';
import { pullAllDataFromCloud } from '../../firebase/syncService';

export const TopHeader: React.FC = () => {
  const {
    profile,
    settings,
    setTheme,
    toggleQuickAdd,
    notifications,
    unreadNotificationCount,
    markNotificationsAsRead,
  } = useAppStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 amoled:bg-amoled-card/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 amoled:border-amoled-border px-4 lg:px-8 py-3 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="lg:hidden flex items-center gap-1.5 font-black text-sm text-slate-900 dark:text-white shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="tracking-tight">Myself</span>
        </div>
      </div>

      {/* Right: Gamification Badges & Action Icons */}
      <div className="flex items-center gap-3">
        {/* Streak Counter */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{profile.streak} Day Streak</span>
        </div>

        {/* Firebase Cloud & Google Login Button */}
        {settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1' ? (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
            title="Manage Firebase Cloud Sync"
          >
            {profile.photoURL ? (
              <img src={profile.photoURL} alt="Avatar" className="w-4 h-4 rounded-full" />
            ) : (
              <Cloud className="w-4 h-4 text-emerald-500" />
            )}
            <span className="hidden sm:inline truncate max-w-[100px]">{profile.name || 'Cloud Synced'}</span>
          </button>
        ) : (
          <button
            onClick={async () => {
              const res = await loginWithGoogle();
              if (res.success && res.user) {
                await pullAllDataFromCloud(res.user.uid);
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold shadow-sm transition-all active:scale-95"
            title="Sign in with Google"
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
            <span className="hidden sm:inline">Google Sign In</span>
          </button>
        )}

        {/* Theme Selector Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 amoled:bg-amoled-muted p-1 rounded-xl gap-0.5 border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg transition-colors ${
              settings.theme === 'light'
                ? 'bg-white text-amber-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Light Theme"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg transition-colors ${
              settings.theme === 'dark'
                ? 'bg-slate-900 text-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dark Theme"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 amoled:bg-amoled-card border border-slate-200 dark:border-slate-800 amoled:border-amoled-border rounded-2xl shadow-xl z-50 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h4>
                <button
                  onClick={() => {
                    markNotificationsAsRead();
                    setShowNotifications(false);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Check className="w-3.5 h-3.5" /> Mark read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-2.5 text-xs">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => toggleQuickAdd(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Quick Add
        </button>
      </div>

      <FirebaseAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};
