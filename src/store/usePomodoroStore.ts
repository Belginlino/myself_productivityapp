import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PomodoroMode, PomodoroSettings, PomodoroSession } from '../types';
import { playChimeSound, playClickSound } from '../utils/audio';

interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number; // seconds
  isRunning: boolean;
  completedPomodoros: number;
  completedTodayCount: number;
  lastCompletedDate: string; // YYYY-MM-DD
  selectedTaskId: string | null;
  history: PomodoroSession[];
  settings: PomodoroSettings;

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  skipSession: () => void;
  setMode: (mode: PomodoroMode) => void;
  setSelectedTaskId: (taskId: string | null) => void;
  updateSettings: (updates: Partial<PomodoroSettings>) => void;
  completeSession: () => void;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
};

const getDurationForMode = (mode: PomodoroMode, settings: PomodoroSettings): number => {
  switch (mode) {
    case 'work':
      return settings.workDuration * 60;
    case 'shortBreak':
      return settings.shortBreakDuration * 60;
    case 'longBreak':
      return settings.longBreakDuration * 60;
  }
};

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      mode: 'work',
      timeLeft: DEFAULT_SETTINGS.workDuration * 60,
      isRunning: false,
      completedPomodoros: 0,
      completedTodayCount: 0,
      lastCompletedDate: getTodayStr(),
      selectedTaskId: null,
      history: [],
      settings: DEFAULT_SETTINGS,

      startTimer: () => {
        const { settings } = get();
        if (settings.soundEnabled) {
          playClickSound();
        }
        set({ isRunning: true });
      },

      pauseTimer: () => {
        const { settings } = get();
        if (settings.soundEnabled) {
          playClickSound();
        }
        set({ isRunning: false });
      },

      resetTimer: () => {
        const { mode, settings } = get();
        const initialSeconds = getDurationForMode(mode, settings);
        set({ isRunning: false, timeLeft: initialSeconds });
      },

      setMode: (mode: PomodoroMode) => {
        const { settings } = get();
        const initialSeconds = getDurationForMode(mode, settings);
        set({ mode, isRunning: false, timeLeft: initialSeconds });
      },

      setSelectedTaskId: (taskId: string | null) => {
        set({ selectedTaskId: taskId });
      },

      updateSettings: (updates: Partial<PomodoroSettings>) => {
        const newSettings = { ...get().settings, ...updates };
        const { mode, isRunning } = get();
        
        let newTimeLeft = get().timeLeft;
        if (!isRunning) {
          newTimeLeft = getDurationForMode(mode, newSettings);
        }

        set({
          settings: newSettings,
          timeLeft: newTimeLeft,
        });
      },

      skipSession: () => {
        const { mode, completedPomodoros, settings } = get();
        let nextMode: PomodoroMode = 'work';

        if (mode === 'work') {
          const nextCount = completedPomodoros + 1;
          if (nextCount % settings.longBreakInterval === 0) {
            nextMode = 'longBreak';
          } else {
            nextMode = 'shortBreak';
          }
        } else {
          nextMode = 'work';
        }

        const nextDuration = getDurationForMode(nextMode, settings);
        set({
          mode: nextMode,
          isRunning: false,
          timeLeft: nextDuration,
        });
      },

      completeSession: () => {
        const { mode, completedPomodoros, completedTodayCount, lastCompletedDate, settings, selectedTaskId, history } = get();
        const today = getTodayStr();
        
        // Play chime sound if enabled
        if (settings.soundEnabled) {
          playChimeSound(mode === 'work' ? 'workDone' : 'breakDone');
        }

        // Haptic feedback if supported
        if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
          try {
            navigator.vibrate([200, 100, 200]);
          } catch (_) {}
        }

        let newCompletedTotal = completedPomodoros;
        let newCompletedToday = lastCompletedDate === today ? completedTodayCount : 0;
        let newHistory = [...history];

        if (mode === 'work') {
          newCompletedTotal += 1;
          newCompletedToday += 1;

          const session: PomodoroSession = {
            id: 'pomo-' + Date.now(),
            mode: 'work',
            durationMinutes: settings.workDuration,
            completedAt: new Date().toISOString(),
            taskId: selectedTaskId || undefined,
          };
          newHistory = [session, ...newHistory.slice(0, 49)];
        }

        // Determine next mode
        let nextMode: PomodoroMode = 'work';
        if (mode === 'work') {
          if (newCompletedTotal % settings.longBreakInterval === 0) {
            nextMode = 'longBreak';
          } else {
            nextMode = 'shortBreak';
          }
        } else {
          nextMode = 'work';
        }

        const shouldAutoStart = nextMode === 'work' ? settings.autoStartPomodoros : settings.autoStartBreaks;
        const nextDuration = getDurationForMode(nextMode, settings);

        set({
          mode: nextMode,
          isRunning: shouldAutoStart,
          timeLeft: nextDuration,
          completedPomodoros: newCompletedTotal,
          completedTodayCount: newCompletedToday,
          lastCompletedDate: today,
          history: newHistory,
        });
      },

      tick: () => {
        const { timeLeft, isRunning } = get();
        if (!isRunning) return;

        if (timeLeft <= 1) {
          get().completeSession();
        } else {
          set({ timeLeft: timeLeft - 1 });
        }
      },
    }),
    {
      name: 'myself-pomodoro-store',
    }
  )
);
