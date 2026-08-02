import React, { useState } from 'react';
import { Home, CheckSquare, Clock, LogOut, Cloud, Mail } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { loginWithGoogle, logoutFirebase } from '../../firebase/authService';
import { pullAllDataFromCloud } from '../../firebase/syncService';
import { FirebaseAuthModal } from '../common/FirebaseAuthModal';

export const navItems: { id: 'home' | 'tasks' | 'routines'; label: string; icon: any }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'routines', label: 'Daily Routine', icon: Clock },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, profile, settings } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-[rgba(10,10,10,0.65)] backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 h-screen sticky top-0 z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3.5 border-b border-slate-200/80 dark:border-white/10">
        <img
          src="/favicon.svg"
          alt="Myself Logo"
          className="w-9 h-9 rounded-2xl shadow-md"
        />
        <div>
          <h1 className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-none">
            Myself
          </h1>
          <span className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
            Personal Planner
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-full font-bold text-xs transition-all duration-300 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-black' : 'text-slate-500 dark:text-neutral-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: Cloud Auth Account */}
      <div className="p-4 m-3 rounded-3xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs backdrop-blur-md">
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full ring-2 ring-slate-300 dark:ring-white/30 shrink-0 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold text-xs flex items-center justify-center shrink-0">
                  {(profile.name || profile.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 dark:text-white truncate text-xs">
                  {profile.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-white/10 text-[11px]">
              <span className="text-slate-900 dark:text-white font-bold flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> Synced
              </span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="text-slate-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 font-medium flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <p className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
              Cloud Sync & Backup
            </p>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs transition-all shadow-md active:scale-98"
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
              <span>Google Sign In</span>
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-white/15 transition-all active:scale-98"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Sign In</span>
            </button>
          </div>
        )}
      </div>

      <FirebaseAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialTab="login" />
    </aside>
  );
};
