export type ThemeMode = 'light' | 'dark' | 'amoled';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'archived';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type RoutineTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type GoalCategory = 'personal' | 'career' | 'health' | 'finance' | 'learning' | 'other';
export type JournalMood = 'amazing' | 'good' | 'okay' | 'down' | 'stressed';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  timezone: string;
  createdAt: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  longestStreak: number;
}

export interface AppSettings {
  theme: ThemeMode;
  accentColor: string;
  notificationsEnabled: boolean;
  reminderSound: boolean;
  vibration: boolean;
  weekStartsOn: 0 | 1; // 0 = Sun, 1 = Mon
  backupEnabled: boolean;
  firebaseConnected: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  status: TaskStatus;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  reminder?: string;
  projectId?: string;
  goalId?: string;
  labels: string[];
  subtasks: SubTask[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  targetCount: number; // e.g., 1 time per day
  streak: number;
  longestStreak: number;
  completedDates: string[]; // ['YYYY-MM-DD']
  createdAt: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  description?: string;
  timeOfDay: RoutineTimeOfDay;
  startTime: string; // HH:mm
  repeatDays: number[]; // [0..6]
  reminder: boolean;
  completedDates: string[]; // ['YYYY-MM-DD']
  streak: number;
  icon: string;
  color: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetDate: string;
  milestones: Milestone[];
  progress: number; // 0-100
  completed: boolean;
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  color: string;
  icon: string;
  deadline?: string;
  taskIds: string[];
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  locked: boolean;
  password?: string;
  folder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalItem {
  id: string;
  date: string; // YYYY-MM-DD
  mood: JournalMood;
  gratitude: string[];
  wins: string[];
  challenges: string[];
  lessons: string;
  content: string;
  photos: string[];
  createdAt: string;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
}

export interface CodingSession {
  id: string;
  language: string;
  project: string;
  durationMinutes: number;
  repository?: string;
  technologies: string[];
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface PomodoroSession {
  id: string;
  sessionType: 'work' | 'shortBreak' | 'longBreak';
  durationMinutes: number;
  completed: boolean;
  startedAt: string;
  endedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  scheduledAt: string;
  type: 'task' | 'habit' | 'routine' | 'pomodoro' | 'study' | 'general';
  read: boolean;
  createdAt: string;
}
