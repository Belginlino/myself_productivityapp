import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JournalItem } from '../types';

interface JournalState {
  journals: JournalItem[];
  addJournal: (entry: Omit<JournalItem, 'id' | 'createdAt'>) => JournalItem;
  updateJournal: (id: string, updates: Partial<JournalItem>) => void;
  deleteJournal: (id: string) => void;
}

const initialJournals: JournalItem[] = [];

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      journals: initialJournals,

      addJournal: (entryData) => {
        const newEntry: JournalItem = {
          ...entryData,
          id: 'journal-' + Date.now(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ journals: [newEntry, ...state.journals] }));
        return newEntry;
      },

      updateJournal: (id, updates) =>
        set((state) => ({
          journals: state.journals.map((j) => (j.id === id ? { ...j, ...updates } : j)),
        })),

      deleteJournal: (id) =>
        set((state) => ({
          journals: state.journals.filter((j) => j.id !== id),
        })),
    }),
    {
      name: 'myself-journal-store',
    }
  )
);
