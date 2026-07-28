import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudySession, CodingSession } from '../types';

interface StudyCodingState {
  studySessions: StudySession[];
  codingSessions: CodingSession[];

  addStudySession: (session: Omit<StudySession, 'id'>) => StudySession;
  deleteStudySession: (id: string) => void;

  addCodingSession: (session: Omit<CodingSession, 'id'>) => CodingSession;
  deleteCodingSession: (id: string) => void;
}

const initialStudySessions: StudySession[] = [];
const initialCodingSessions: CodingSession[] = [];

export const useStudyCodingStore = create<StudyCodingState>()(
  persist(
    (set) => ({
      studySessions: initialStudySessions,
      codingSessions: initialCodingSessions,

      addStudySession: (sessionData) => {
        const newSession: StudySession = {
          ...sessionData,
          id: 'study-' + Date.now(),
        };
        set((state) => ({ studySessions: [newSession, ...state.studySessions] }));
        return newSession;
      },

      deleteStudySession: (id) =>
        set((state) => ({
          studySessions: state.studySessions.filter((s) => s.id !== id),
        })),

      addCodingSession: (sessionData) => {
        const newSession: CodingSession = {
          ...sessionData,
          id: 'code-' + Date.now(),
        };
        set((state) => ({ codingSessions: [newSession, ...state.codingSessions] }));
        return newSession;
      },

      deleteCodingSession: (id) =>
        set((state) => ({
          codingSessions: state.codingSessions.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'myself-study-coding-store',
    }
  )
);
