import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoutineItem, StreakData } from '../types';
import {
  scheduleRoutineNotification,
  cancelRoutineNotification,
} from '../services/notificationService';

interface RoutineState {
  routines: RoutineItem[];
  streakData: StreakData;

  // Actions
  addRoutine: (routine: Omit<RoutineItem, 'id' | 'completedDates' | 'order' | 'createdAt'>) => RoutineItem;
  updateRoutine: (id: string, updates: Partial<RoutineItem>) => void;
  deleteRoutine: (id: string) => void;
  reorderRoutines: (startIndex: number, endIndex: number) => void;
  toggleRoutineCompletion: (id: string, dateStr?: string) => void;
  recalculateStreaks: () => void;
}

const initialStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  calendarHistory: {},
};

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: [],
      streakData: initialStreakData,

      addRoutine: (routineData) => {
        const routines = get().routines;
        const newRoutine: RoutineItem = {
          ...routineData,
          id: 'routine-' + Date.now(),
          completedDates: [],
          order: routines.length,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ routines: [...state.routines, newRoutine] }));

        if (newRoutine.reminder) {
          scheduleRoutineNotification(newRoutine);
        }

        get().recalculateStreaks();
        return newRoutine;
      },

      updateRoutine: (id, updates) => {
        const existing = get().routines.find((r) => r.id === id);
        if (!existing) return;

        const updated = { ...existing, ...updates };

        set((state) => ({
          routines: state.routines.map((r) => (r.id === id ? updated : r)),
        }));

        cancelRoutineNotification(id);
        if (updated.reminder) {
          scheduleRoutineNotification(updated);
        }

        get().recalculateStreaks();
      },

      deleteRoutine: (id) => {
        cancelRoutineNotification(id);
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        }));
        get().recalculateStreaks();
      },

      reorderRoutines: (startIndex, endIndex) => {
        const list = Array.from(get().routines);
        const [removed] = list.splice(startIndex, 1);
        list.splice(endIndex, 0, removed);
        const reordered = list.map((item, idx) => ({ ...item, order: idx }));
        set({ routines: reordered });
      },

      toggleRoutineCompletion: (id, dateStr) => {
        const today = dateStr || new Date().toISOString().split('T')[0];
        const routine = get().routines.find((r) => r.id === id);
        if (!routine) return;

        const isDone = routine.completedDates.includes(today);
        const updatedDates = isDone
          ? routine.completedDates.filter((d) => d !== today)
          : [...routine.completedDates, today];

        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id ? { ...r, completedDates: updatedDates } : r
          ),
        }));

        get().recalculateStreaks();
      },

      recalculateStreaks: () => {
        const routines = get().routines;
        if (routines.length === 0) {
          set({
            streakData: {
              currentStreak: 0,
              longestStreak: 0,
              calendarHistory: {},
            },
          });
          return;
        }

        const calendarHistory: Record<string, boolean> = {};

        // Collect all dates from all completedDates
        const allDates = new Set<string>();
        routines.forEach((r) => {
          r.completedDates.forEach((d) => allDates.add(d));
        });

        // Always check today
        const todayStr = new Date().toISOString().split('T')[0];
        allDates.add(todayStr);

        allDates.forEach((date) => {
          const allCompletedForDate = routines.every((r) => r.completedDates.includes(date));
          calendarHistory[date] = allCompletedForDate;
        });

        // Calculate consecutive streaks ending today or yesterday
        let currentStreak = 0;
        let longestStreak = 0;

        const todayDateObj = new Date();
        let checkDate = new Date(todayDateObj);

        // Check if today is completed or if we check from yesterday
        let dateKey = checkDate.toISOString().split('T')[0];
        let isTodayDone = calendarHistory[dateKey] === true;

        if (!isTodayDone) {
          // Check yesterday if today isn't done yet
          checkDate.setDate(checkDate.getDate() - 1);
          dateKey = checkDate.toISOString().split('T')[0];
        }

        while (calendarHistory[dateKey] === true) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
          dateKey = checkDate.toISOString().split('T')[0];
        }

        // Calculate longest streak historically
        const sortedDates = Object.keys(calendarHistory).sort();
        let tempStreak = 0;
        sortedDates.forEach((d) => {
          if (calendarHistory[d]) {
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
          } else {
            tempStreak = 0;
          }
        });

        if (currentStreak > longestStreak) longestStreak = currentStreak;

        set({
          streakData: {
            currentStreak,
            longestStreak,
            calendarHistory,
          },
        });
      },
    }),
    {
      name: 'myself-routine-store',
    }
  )
);
