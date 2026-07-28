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
} from 'lucide-react';

import { useAppStore } from '../../store/useAppStore';

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
    </header>
  );
};
