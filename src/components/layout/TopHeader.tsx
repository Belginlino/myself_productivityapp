import React, { useState } from 'react';
import { Plus, Moon, Sun, Bell, Flame, Check, Cloud } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useRoutineStore } from '../../store/useRoutineStore';
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

  const { streakData } = useRoutineStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-[rgba(5,5,5,0.7)] backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="lg:hidden flex items-center gap-2.5 font-black text-base text-slate-900 dark:text-white shrink-0">
          <img src="/favicon.svg" alt="Myself Logo" className="w-8 h-8 rounded-xl shadow-md" />
          <span className="tracking-tight">Myself</span>
        </div>
      </div>

      {/* Right: Actions & Badges */}
      <div className="flex items-center gap-3">
        {/* Streak Counter */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-slate-900 dark:text-white text-xs font-bold shadow-sm">
          <Flame className="w-4 h-4 text-slate-900 dark:text-white fill-slate-900 dark:fill-white" />
          <span>{streakData.currentStreak} Day Streak</span>
        </div>

        {/* Firebase Cloud Sync Status / Google Sign In */}
        {settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1' ? (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/15 hover:bg-slate-200 dark:hover:bg-white/20 text-xs font-semibold transition-all"
            title="Cloud Synced"
          >
            {profile.photoURL ? (
              <img src={profile.photoURL} alt="Avatar" className="w-4 h-4 rounded-full" />
            ) : (
              <Cloud className="w-4 h-4 text-slate-900 dark:text-white" />
            )}
            <span className="hidden sm:inline truncate max-w-[100px]">
              {profile.name || 'Synced'}
            </span>
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
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 text-xs font-bold shadow-sm transition-all active:scale-95"
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

        {/* Theme Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-white/10 p-1 rounded-full border border-slate-200/80 dark:border-white/15 backdrop-blur-md">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-full transition-colors ${
              settings.theme === 'light'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 dark:text-neutral-400 hover:text-white'
            }`}
            title="Light Theme"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-full transition-colors ${
              settings.theme === 'dark'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-500 dark:text-neutral-400 hover:text-white'
            }`}
            title="Dark Theme"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-full text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 dark:bg-white ring-2 ring-white dark:ring-black" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-[rgba(18,18,18,0.9)] backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-3xl shadow-2xl z-50 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h4>
                <button
                  onClick={() => {
                    markNotificationsAsRead();
                    setShowNotifications(false);
                  }}
                  className="text-xs text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-semibold"
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

        {/* Quick Add Button */}
        <button
          onClick={() => toggleQuickAdd(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-extrabold shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Quick Add
        </button>
      </div>

      <FirebaseAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};
