import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Target,
  Calendar,
  Timer,
  Settings,
  Sparkles,
  LogOut,
  Cloud,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { loginWithGoogle, logoutFirebase } from '../../firebase/authService';
import { pullAllDataFromCloud } from '../../firebase/syncService';

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'routines', label: 'Daily Routine', icon: Clock },
  { id: 'goals', label: 'Goals & Projects', icon: Target },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'pomodoro', label: 'Pomodoro Focus', icon: Timer },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, profile, settings } = useAppStore();
  const [loading, setLoading] = useState(false);

  const isConnected = settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1';

  const handleGoogleLogin = async () => {
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success && res.user) {
      await pullAllDataFromCloud(res.user.uid);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await logoutFirebase();
    setLoading(false);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 amoled:bg-amoled-card border-r border-slate-200/80 dark:border-slate-800/80 amoled:border-amoled-border h-screen sticky top-0 z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
            Myself
          </h1>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Productivity OS v1.0
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: Google Login or User Account */}
      <div className="p-3 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
        {isConnected ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-8 h-8 rounded-full ring-2 ring-indigo-500 shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {(profile.name || profile.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 dark:text-white truncate text-xs">
                  {profile.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5" /> Synced
              </span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="text-slate-400 hover:text-red-500 font-medium flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Cloud Backup & Multi-Device Sync
            </p>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs transition-all shadow-sm active:scale-98"
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
              <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
