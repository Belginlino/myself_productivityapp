import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NoteItem } from '../types';

interface NoteState {
  notes: NoteItem[];
  searchQuery: string;
  selectedTag: string | null;

  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => NoteItem;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  toggleLockNote: (id: string, password?: string) => void;
}

const initialNotes: NoteItem[] = [];

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      notes: initialNotes,
      searchQuery: '',
      selectedTag: null,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedTag: (tag) => set({ selectedTag: tag }),

      addNote: (noteData) => {
        const newNote: NoteItem = {
          ...noteData,
          id: 'note-' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
        return newNote;
      },

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),

      togglePinNote: (id) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n
          ),
        })),

      toggleLockNote: (id, password) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  locked: !n.locked,
                  password: !n.locked ? password : undefined,
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),
    }),
    {
      name: 'myself-note-store',
    }
  )
);
