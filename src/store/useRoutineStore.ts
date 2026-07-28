import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoutineItem } from '../types';

interface RoutineState {
  routines: RoutineItem[];
  addRoutine: (routine: Omit<RoutineItem, 'id' | 'streak' | 'completedDates'>) => RoutineItem;
  updateRoutine: (id: string, updates: Partial<RoutineItem>) => void;
  deleteRoutine: (id: string) => void;
  toggleRoutineCompletion: (id: string, dateStr: string) => void;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: [],


      addRoutine: (routineData) => {
        const newRoutine: RoutineItem = {
          ...routineData,
          id: 'routine-' + Date.now(),
          streak: 0,
          completedDates: [],
        };
        set((state) => ({ routines: [...state.routines, newRoutine] }));
        return newRoutine;
      },

      updateRoutine: (id, updates) =>
        set((state) => ({
          routines: state.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteRoutine: (id) =>
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        })),

      toggleRoutineCompletion: (id, dateStr) => {
        const routine = get().routines.find((r) => r.id === id);
        if (!routine) return;

        const isDone = routine.completedDates.includes(dateStr);
        let updatedDates: string[];

        if (isDone) {
          updatedDates = routine.completedDates.filter((d) => d !== dateStr);
        } else {
          updatedDates = [...routine.completedDates, dateStr];
        }

        const updatedStreak = isDone ? Math.max(0, routine.streak - 1) : routine.streak + 1;

        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id
              ? {
                  ...r,
                  completedDates: updatedDates,
                  streak: updatedStreak,
                }
              : r
          ),
        }));
      },
    }),
    {
      name: 'myself-routine-store',
    }
  )
);
