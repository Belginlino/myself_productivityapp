import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, AppSettings, ThemeMode, NotificationItem } from '../types';

interface AppState {
  profile: UserProfile;
  settings: AppSettings;
  activeTab: string;
  isQuickAddOpen: boolean;
  isSearchOpen: boolean;
  notifications: NotificationItem[];
  unreadNotificationCount: number;

  // Actions
  setActiveTab: (tab: string) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleQuickAdd: (open?: boolean) => void;
  toggleSearch: (open?: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  addXP: (amount: number) => { leveledUp: boolean; newLevel: number };
  addCoins: (amount: number) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationsAsRead: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
  eraseAllData: () => void;
}

const initialProfile: UserProfile = {
  uid: 'local-user-1',
  name: '',
  email: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  createdAt: new Date().toISOString(),
  level: 1,
  xp: 0,
  coins: 0,
  streak: 0,
  longestStreak: 0,
};

const initialSettings: AppSettings = {
  theme: 'dark',
  accentColor: '#4F46E5',
  notificationsEnabled: true,
  reminderSound: true,
  vibration: true,
  weekStartsOn: 1,
  backupEnabled: true,
  firebaseConnected: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      settings: initialSettings,
      activeTab: 'dashboard',
      isQuickAddOpen: false,
      isSearchOpen: false,
      notifications: [],
      unreadNotificationCount: 0,

      setActiveTab: (tab) => set({ activeTab: tab }),

      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }));
        // Apply class to document element
        const root = document.documentElement;
        root.classList.remove('light', 'dark', 'amoled');
        if (theme === 'amoled') {
          root.classList.add('dark', 'amoled');
        } else {
          root.classList.add(theme);
        }
      },

      toggleQuickAdd: (open) =>
        set((state) => ({
          isQuickAddOpen: open !== undefined ? open : !state.isQuickAddOpen,
        })),

      toggleSearch: (open) =>
        set((state) => ({
          isSearchOpen: open !== undefined ? open : !state.isSearchOpen,
        })),

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      addXP: (amount) => {
        const { profile } = get();
        const newXP = profile.xp + amount;
        // Level up threshold formula: level * 200 XP
        const requiredXPForNextLevel = profile.level * 200;
        let leveledUp = false;
        let newLevel = profile.level;

        if (newXP >= requiredXPForNextLevel) {
          leveledUp = true;
          newLevel += 1;
        }

        set({
          profile: {
            ...profile,
            xp: newXP,
            level: newLevel,
          },
        });

        return { leveledUp, newLevel };
      },

      addCoins: (amount) =>
        set((state) => ({
          profile: {
            ...state.profile,
            coins: state.profile.coins + amount,
          },
        })),

      addNotification: (notificationData) => {
        const newNotif: NotificationItem = {
          ...notificationData,
          id: 'notif-' + Date.now(),
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
          unreadNotificationCount: state.unreadNotificationCount + 1,
        }));
      },

      markNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadNotificationCount: 0,
        })),

      exportDataJSON: () => {
        const data = {
          localStorage: { ...localStorage },
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
        };
        return JSON.stringify(data, null, 2);
      },

      importDataJSON: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (parsed.localStorage) {
            Object.keys(parsed.localStorage).forEach((key) => {
              localStorage.setItem(key, parsed.localStorage[key]);
            });
            window.location.reload();
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      eraseAllData: () => {
        const storeKeys = [
          'myself-app-store',
          'myself-task-store',
          'myself-habit-store',
          'myself-routine-store',
          'myself-goal-store',
          'myself-note-store',
          'myself-journal-store',
          'myself-study-coding-store',
          'myself-pomodoro-store',
          'myself-gamification-store',
        ];
        storeKeys.forEach((key) => localStorage.removeItem(key));
        window.location.reload();
      },
    }),
    {
      name: 'myself-app-store',
    }
  )
);
