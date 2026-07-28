import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PomodoroSession } from '../types';

interface PomodoroState {
  sessionType: 'work' | 'shortBreak' | 'longBreak';
  workDurationMinutes: number; // 25
  shortBreakMinutes: number; // 5
  longBreakMinutes: number; // 15
  secondsRemaining: number;
  isRunning: boolean;
  totalSessionsCompleted: number;
  sessionHistory: PomodoroSession[];

  // Actions
  setSessionType: (type: 'work' | 'shortBreak' | 'longBreak') => void;
  setDurations: (work: number, shortBreak: number, longBreak: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  completeSession: () => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      sessionType: 'work',
      workDurationMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      secondsRemaining: 25 * 60,
      isRunning: false,
      totalSessionsCompleted: 0,
      sessionHistory: [],

      setSessionType: (type) => {
        const { workDurationMinutes, shortBreakMinutes, longBreakMinutes } = get();
        let targetMinutes = workDurationMinutes;
        if (type === 'shortBreak') targetMinutes = shortBreakMinutes;
        if (type === 'longBreak') targetMinutes = longBreakMinutes;

        set({
          sessionType: type,
          secondsRemaining: targetMinutes * 60,
          isRunning: false,
        });
      },

      setDurations: (work, shortBreak, longBreak) => {
        const { sessionType } = get();
        let currentSeconds = work * 60;
        if (sessionType === 'shortBreak') currentSeconds = shortBreak * 60;
        if (sessionType === 'longBreak') currentSeconds = longBreak * 60;

        set({
          workDurationMinutes: work,
          shortBreakMinutes: shortBreak,
          longBreakMinutes: longBreak,
          secondsRemaining: currentSeconds,
          isRunning: false,
        });
      },

      startTimer: () => set({ isRunning: true }),
      pauseTimer: () => set({ isRunning: false }),

      resetTimer: () => {
        const { sessionType, workDurationMinutes, shortBreakMinutes, longBreakMinutes } = get();
        let mins = workDurationMinutes;
        if (sessionType === 'shortBreak') mins = shortBreakMinutes;
        if (sessionType === 'longBreak') mins = longBreakMinutes;

        set({
          secondsRemaining: mins * 60,
          isRunning: false,
        });
      },

      tickTimer: () => {
        const { secondsRemaining, isRunning, completeSession } = get();
        if (!isRunning) return;

        if (secondsRemaining <= 1) {
          completeSession();
        } else {
          set({ secondsRemaining: secondsRemaining - 1 });
        }
      },

      completeSession: () => {
        const { sessionType, workDurationMinutes, shortBreakMinutes, longBreakMinutes, totalSessionsCompleted, sessionHistory } = get();

        let mins = workDurationMinutes;
        if (sessionType === 'shortBreak') mins = shortBreakMinutes;
        if (sessionType === 'longBreak') mins = longBreakMinutes;

        const newSession: PomodoroSession = {
          id: 'pomo-' + Date.now(),
          sessionType,
          durationMinutes: mins,
          completed: true,
          startedAt: new Date(Date.now() - mins * 60 * 1000).toISOString(),
          endedAt: new Date().toISOString(),
        };

        const nextType = sessionType === 'work' ? 'shortBreak' : 'work';
        const nextMins = nextType === 'work' ? workDurationMinutes : shortBreakMinutes;

        set({
          isRunning: false,
          sessionType: nextType,
          secondsRemaining: nextMins * 60,
          totalSessionsCompleted: sessionType === 'work' ? totalSessionsCompleted + 1 : totalSessionsCompleted,
          sessionHistory: [newSession, ...sessionHistory],
        });
      },
    }),
    {
      name: 'myself-pomodoro-store',
    }
  )
);
