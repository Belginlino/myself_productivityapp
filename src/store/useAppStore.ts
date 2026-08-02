import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, AppSettings, ThemeMode, NotificationItem } from '../types';

interface AppState {
  profile: UserProfile;
  settings: AppSettings;
  activeTab: 'home' | 'tasks' | 'routines';
  isQuickAddOpen: boolean;
  isSettingsOpen: boolean;
  notifications: NotificationItem[];
  unreadNotificationCount: number;

  // Actions
  setActiveTab: (tab: 'home' | 'tasks' | 'routines') => void;
  setTheme: (theme: ThemeMode) => void;
  toggleQuickAdd: (open?: boolean) => void;
  toggleSettings: (open?: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationsAsRead: () => void;

  // Security / PIN actions
  setPinCode: (pin: string) => void;
  togglePinLock: (enabled: boolean) => void;
  unlockApp: (inputPin: string) => boolean;
  lockApp: () => void;
}

const initialProfile: UserProfile = {
  uid: 'local-user-1',
  name: '',
  email: '',
  createdAt: new Date().toISOString(),
};

const initialSettings: AppSettings = {
  theme: 'dark',
  notificationsEnabled: true,
  reminderSound: true,
  vibration: true,
  firebaseConnected: false,
  preferredLoginMethod: 'email',
  autoSyncOnLogin: true,
  rememberMe: true,
  pinLockEnabled: false,
  pinCode: '',
  isAppLocked: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      settings: initialSettings,
      activeTab: 'home',
      isQuickAddOpen: false,
      isSettingsOpen: false,
      notifications: [],
      unreadNotificationCount: 0,

      setActiveTab: (tab) => set({ activeTab: tab }),

      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }));
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
      },

      toggleQuickAdd: (open) =>
        set((state) => ({
          isQuickAddOpen: open !== undefined ? open : !state.isQuickAddOpen,
        })),

      toggleSettings: (open) =>
        set((state) => ({
          isSettingsOpen: open !== undefined ? open : !state.isSettingsOpen,
        })),

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
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

      setPinCode: (pin) =>
        set((state) => ({
          settings: { ...state.settings, pinCode: pin },
        })),

      togglePinLock: (enabled) =>
        set((state) => ({
          settings: {
            ...state.settings,
            pinLockEnabled: enabled,
            isAppLocked: enabled ? false : false,
          },
        })),

      unlockApp: (inputPin) => {
        const currentPin = get().settings.pinCode;
        if (!currentPin || inputPin === currentPin) {
          set((state) => ({
            settings: { ...state.settings, isAppLocked: false },
          }));
          return true;
        }
        return false;
      },

      lockApp: () =>
        set((state) => ({
          settings: { ...state.settings, isAppLocked: true },
        })),
    }),
    {
      name: 'myself-app-store',
    }
  )
);
