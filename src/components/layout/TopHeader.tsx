import React, { useState } from 'react';
import { Plus, Bell, Flame, Check, Cloud, Mail, Mic, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { FirebaseAuthModal } from '../common/FirebaseAuthModal';
import { VoicePermissionModal } from '../common/VoicePermissionModal';

export const TopHeader: React.FC = () => {
  const {
    profile,
    settings,
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
    <header className="sticky top-0 z-20 bg-[#1B2435]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <img
          src="/logo.jpg"
          alt="Tempo Logo"
          className="w-8 h-8 rounded-xl object-cover border border-white/15 shadow-md"
        />
        <span className="font-extrabold text-base text-white tracking-tight">
          Tempo
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Streak Counter */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5D73]/15 border border-[#FF5D73]/30 text-[#FF5D73] text-xs font-bold font-mono">
          <Flame className="w-3.5 h-3.5 fill-[#FF5D73]" />
          <span>{streakData.currentStreak} Days</span>
        </div>

        {/* Cloud Sync */}
        {settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1' ? (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/15 hover:bg-white/20 text-xs font-bold transition-all"
            title="Cloud Synced"
          >
            <Cloud className="w-3.5 h-3.5 text-[#76E56A]" />
            <span className="hidden md:inline truncate max-w-[90px]">
              {profile.name || 'Synced'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-[#C9F48A] text-[#1B2435] font-bold text-xs shadow-glow-accent hover:bg-[#b1e06d] transition-all flex items-center gap-1.5"
            title="Sign in with Email"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full bg-[#23324A] text-[#A8B3C7] hover:text-white border border-white/5 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF5D73] ring-2 ring-[#1B2435]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-[#23324A] border border-white/10 rounded-3xl shadow-2xl z-50 p-5 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 className="font-bold text-sm text-white">Notifications</h4>
                <button
                  onClick={() => {
                    markNotificationsAsRead();
                    setShowNotifications(false);
                  }}
                  className="text-xs text-[#A8B3C7] hover:text-white flex items-center gap-1 font-bold"
                >
                  <Check className="w-3.5 h-3.5 text-[#C9F48A]" /> Mark read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-white/5 mt-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#A8B3C7] text-center py-5">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-3 text-xs">
                      <p className="font-bold text-white">{n.title}</p>
                      <p className="text-[#A8B3C7] mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={() => toggleSettings(true)}
          className="p-2 rounded-full bg-[#23324A] text-[#A8B3C7] hover:text-white border border-white/5 transition-colors"
          title="Open Settings"
        >
          <Settings className="w-4 h-4" />
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
