import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, CheckSquare, Clock, LogOut, Cloud, Mail, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { logoutFirebase } from '../../firebase/authService';
import { FirebaseAuthModal } from '../common/FirebaseAuthModal';

export const navItems: { id: 'home' | 'tasks' | 'routines'; label: string; icon: any }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks Timeline', icon: CheckSquare },
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
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#1B2435] border-r border-white/10 h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3.5 border-b border-white/10">
        <img src="/logo.jpg" alt="Myself Logo" className="w-10 h-10 rounded-2xl object-cover border border-white/15 shadow-md" />
        <div>
          <h1 className="font-extrabold text-lg text-white tracking-tight leading-none">
            Myself
          </h1>
          <span className="text-[11px] font-bold text-[#C9F48A]">
            Mobile Productivity
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
              className={`relative w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-xs transition-all duration-200 ${
                isActive ? 'text-[#1B2435]' : 'text-[#A8B3C7] hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarNav"
                  className="absolute inset-0 rounded-2xl bg-[#C9F48A] shadow-glow-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 w-4 h-4 shrink-0" />
              <span className="relative z-10 truncate">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => toggleSettings(true)}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-xs text-[#A8B3C7] hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-4 h-4 shrink-0 text-[#A8B3C7]" />
          <span className="truncate">Settings & Security</span>
        </button>
      </nav>

      {/* Footer Account Card */}
      <div className="p-4 m-3 rounded-3xl bg-[#23324A] border border-white/10 text-xs">
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C9F48A] text-[#1B2435] font-extrabold text-xs flex items-center justify-center shrink-0 shadow-md">
                {(profile.name || profile.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white truncate text-xs">
                  {profile.name || 'User'}
                </p>
                <p className="text-[10px] text-[#A8B3C7] font-medium truncate">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
              <span className="text-[#76E56A] font-bold flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5" /> Synced
              </span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="text-[#A8B3C7] hover:text-[#FF5D73] font-semibold flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <p className="text-[11px] font-bold text-[#A8B3C7]">
              Cloud Backup
            </p>
            <button
              onClick={() => handleOpenAuth('login')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-extrabold text-xs shadow-glow-accent hover:bg-[#b1e06d] transition-all"
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
