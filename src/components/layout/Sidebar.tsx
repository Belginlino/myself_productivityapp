import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, CheckSquare, Clock, LogOut, Cloud, Mail, UserPlus, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { logoutFirebase } from '../../firebase/authService';
import { FirebaseAuthModal } from '../common/FirebaseAuthModal';

export const navItems: { id: 'home' | 'tasks' | 'routines'; label: string; icon: any }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'routines', label: 'Daily Routine', icon: Clock },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, profile, settings, toggleSettings } = useAppStore();
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
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 h-screen sticky top-0 z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3.5 border-b border-slate-200/80 dark:border-white/10">
        <img src="/logo.jpg" alt="Myself Logo" className="w-9 h-9 rounded-2xl object-cover shadow-md border border-slate-200/80 dark:border-white/15" />
        <div>
          <h1 className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-none">
            Myself
          </h1>
          <span className="text-[11px] font-bold text-slate-400 dark:text-neutral-400">
            Productivity OS
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-extrabold text-xs transition-all duration-200 ${
                isActive
                  ? 'text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarNav"
                  className="absolute inset-0 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`relative z-10 w-4 h-4 shrink-0 ${
                  isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-neutral-500'
                }`}
              />
              <span className="relative z-10 truncate">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => toggleSettings(true)}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-extrabold text-xs text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5 transition-all"
        >
          <Settings className="w-4 h-4 shrink-0 text-slate-400 dark:text-neutral-500" />
          <span className="truncate">Settings & Security</span>
        </button>
      </nav>

      {/* Sidebar Footer Account Card */}
      <div className="p-4 m-3 rounded-3xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-xs backdrop-blur-md">
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                {(profile.name || profile.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-slate-900 dark:text-white truncate text-xs">
                  {profile.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-white/10 text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5" /> Synced
              </span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="text-slate-400 hover:text-red-500 font-semibold flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <p className="text-[11px] font-bold text-slate-400 dark:text-neutral-400">
              Cloud Backup Disconnected
            </p>
            <button
              onClick={() => handleOpenAuth('login')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs shadow-md hover:scale-[1.01] active:scale-98 transition-all"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>Email Sign In</span>
            </button>
          </div>
        )}
      </div>

      <FirebaseAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialTab={authTab} />
    </aside>
  );
};
