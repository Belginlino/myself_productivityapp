export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
}

export type PreferredLoginMethod = 'email' | 'google' | 'guest';

export interface AppSettings {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  reminderSound: boolean;
  vibration: boolean;
  firebaseConnected: boolean;
  preferredLoginMethod: PreferredLoginMethod;
  autoSyncOnLogin: boolean;
  rememberMe: boolean;
  pinLockEnabled: boolean;
  pinCode: string;
  isAppLocked: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  reminder: boolean;
  voiceNote?: string;
  voiceNoteUrl?: string; // Audio Data URL (base64) for WhatsApp-style voice message
  voiceNoteDuration?: number; // Duration in seconds
  status: 'pending' | 'completed';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  time: string; // HH:mm
  repeatEveryDay: boolean;
  reminder: boolean;
  completedDates: string[]; // ['YYYY-MM-DD']
  order: number;
  createdAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  calendarHistory: Record<string, boolean>;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  scheduledAt: string;
  type: 'task' | 'routine';
  read: boolean;
  createdAt: string;
}
