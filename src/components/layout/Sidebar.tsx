import React, { useState } from 'react';
import { Home, CheckSquare, Clock, LogOut, Cloud, Mail, UserPlus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { logoutFirebase } from '../../firebase/authService';
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
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const isConnected = settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1';

  const handleOpenAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
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
              <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold text-xs flex items-center justify-center shrink-0">
                {(profile.name || profile.email || 'U')[0].toUpperCase()}
              </div>
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
              onClick={() => handleOpenAuth('login')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs transition-all shadow-md active:scale-98"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>Email Sign In</span>
            </button>
            <button
              onClick={() => handleOpenAuth('register')}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-white/15 transition-all active:scale-98"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        )}
      </div>

      <FirebaseAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialTab={authTab} />
    </aside>
  );
};
