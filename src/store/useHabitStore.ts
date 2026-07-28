import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HabitItem } from '../types';

interface HabitState {
  habits: HabitItem[];
  addHabit: (habit: Omit<HabitItem, 'id' | 'streak' | 'longestStreak' | 'completedDates' | 'createdAt'>) => HabitItem;
  updateHabit: (id: string, updates: Partial<HabitItem>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, dateStr: string) => boolean; // returns true if checked
}



export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],


      addHabit: (habitData) => {
        const newHabit: HabitItem = {
          ...habitData,
          id: 'habit-' + Date.now(),
          streak: 0,
          longestStreak: 0,
          completedDates: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
        return newHabit;
      },

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      toggleHabitCompletion: (id, dateStr) => {
        const habit = get().habits.find((h) => h.id === id);
        if (!habit) return false;

        const isCompleted = habit.completedDates.includes(dateStr);
        let newCompletedDates: string[];

        if (isCompleted) {
          newCompletedDates = habit.completedDates.filter((d) => d !== dateStr);
        } else {
          newCompletedDates = [...habit.completedDates, dateStr];
        }

        const newStreak = isCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1;
        const newLongest = Math.max(habit.longestStreak, newStreak);

        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completedDates: newCompletedDates,
                  streak: newStreak,
                  longestStreak: newLongest,
                }
              : h
          ),
        }));

        return !isCompleted;
      },
    }),
    {
      name: 'myself-habit-store',
    }
  )
);
