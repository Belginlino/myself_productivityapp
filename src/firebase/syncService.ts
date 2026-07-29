import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocs,
  collection,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { useAppStore } from '../store/useAppStore';
import { useTaskStore } from '../store/useTaskStore';
import { useHabitStore } from '../store/useHabitStore';
import { useRoutineStore } from '../store/useRoutineStore';
import { useGoalStore } from '../store/useGoalStore';
import { useNoteStore } from '../store/useNoteStore';
import { useJournalStore } from '../store/useJournalStore';

export interface SyncStatus {
  success: boolean;
  message: string;
  itemsSynced?: number;
}

/**
 * Pushes all local state from Zustand stores to Cloud Firestore under users/{uid}
 */
export const pushAllDataToCloud = async (uid: string): Promise<SyncStatus> => {
  if (!uid || uid === 'local-user-1') {
    return { success: false, message: 'Must be logged in with Firebase to sync to cloud.' };
  }

  try {
    const batch = writeBatch(db);
    let count = 0;

    // 1. Sync Profile & Settings
    const { profile, settings } = useAppStore.getState();
    const userDocRef = doc(db, 'users', uid);
    batch.set(
      userDocRef,
      {
        uid: uid,
        name: profile.name || 'User',
        email: profile.email || '',
        createdAt: profile.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timezone: profile.timezone || 'UTC',
        photoURL: profile.photoURL || '',
      },
      { merge: true }
    );
    count++;

    const settingsDocRef = doc(db, 'users', uid, 'settings', 'main');
    batch.set(
      settingsDocRef,
      {
        theme: settings.theme || 'dark',
        accentColor: settings.accentColor || '#4F46E5',
        notificationsEnabled: !!settings.notificationsEnabled,
        reminderSound: !!settings.reminderSound,
        vibration: !!settings.vibration,
        weekStartsOn: settings.weekStartsOn ?? 1,
        backupEnabled: !!settings.backupEnabled,
        firebaseConnected: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    count++;

    // 2. Tasks
    const { tasks } = useTaskStore.getState();
    tasks.forEach((task) => {
      const taskRef = doc(db, 'users', uid, 'tasks', task.id);
      const payload: any = {
        title: task.title,
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        labels: Array.isArray(task.labels) ? task.labels : [],
        subtasks: Array.isArray(task.subtasks)
          ? task.subtasks.map((st) => ({
              id: st.id,
              title: st.title,
              completed: !!st.completed,
            }))
          : [],
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: task.updatedAt || new Date().toISOString(),
      };
      if (task.description) payload.description = task.description;
      if (task.dueDate) payload.dueDate = task.dueDate;
      if (task.dueTime) payload.dueTime = task.dueTime;
      if (task.reminder) payload.reminder = task.reminder;
      if (task.projectId) payload.projectId = task.projectId;
      if (task.goalId) payload.goalId = task.goalId;
      if (task.estimatedMinutes) payload.estimatedMinutes = Number(task.estimatedMinutes);
      if (task.actualMinutes) payload.actualMinutes = Number(task.actualMinutes);
      if (task.completedAt) payload.completedAt = task.completedAt;

      batch.set(taskRef, payload, { merge: true });
      count++;
    });

    // 3. Habits
    const { habits } = useHabitStore.getState();
    habits.forEach((habit) => {
      const habitRef = doc(db, 'users', uid, 'habits', habit.id);
      batch.set(
        habitRef,
        {
          title: habit.title,
          icon: habit.icon || 'Target',
          color: habit.color || '#10B981',
          frequency: habit.frequency || 'daily',
          targetCount: habit.targetCount || 1,
          streak: habit.streak || 0,
          longestStreak: habit.longestStreak || 0,
          completedDates: Array.isArray(habit.completedDates) ? habit.completedDates : [],
          createdAt: habit.createdAt || new Date().toISOString(),
          description: habit.description || '',
        },
        { merge: true }
      );
      count++;
    });

    // 4. Routines
    const { routines } = useRoutineStore.getState();
    routines.forEach((routine) => {
      const routineRef = doc(db, 'users', uid, 'routines', routine.id);
      batch.set(
        routineRef,
        {
          title: routine.title,
          timeOfDay: routine.timeOfDay || 'morning',
          startTime: routine.startTime || '08:00',
          repeatDays: Array.isArray(routine.repeatDays) ? routine.repeatDays : [0, 1, 2, 3, 4, 5, 6],
          reminder: !!routine.reminder,
          completedDates: Array.isArray(routine.completedDates) ? routine.completedDates : [],
          streak: routine.streak || 0,
          icon: routine.icon || 'Sun',
          color: routine.color || '#F59E0B',
          description: routine.description || '',
        },
        { merge: true }
      );
      count++;
    });

    // 5. Goals
    const { goals } = useGoalStore.getState();
    goals.forEach((goal) => {
      const goalRef = doc(db, 'users', uid, 'goals', goal.id);
      batch.set(
        goalRef,
        {
          title: goal.title,
          category: goal.category || 'personal',
          targetDate: goal.targetDate || new Date().toISOString().split('T')[0],
          milestones: Array.isArray(goal.milestones)
            ? goal.milestones.map((m) => ({
                id: m.id,
                title: m.title,
                completed: !!m.completed,
                dueDate: m.dueDate || '',
              }))
            : [],
          progress: Math.min(100, Math.max(0, goal.progress || 0)),
          completed: !!goal.completed,
          createdAt: goal.createdAt || new Date().toISOString(),
          description: goal.description || '',
        },
        { merge: true }
      );
      count++;
    });

    // 6. Notes
    const { notes } = useNoteStore.getState();
    notes.forEach((note) => {
      const noteRef = doc(db, 'users', uid, 'notes', note.id);
      batch.set(
        noteRef,
        {
          title: note.title || 'Untitled Note',
          content: note.content || '',
          tags: Array.isArray(note.tags) ? note.tags : [],
          pinned: !!note.pinned,
          locked: !!note.locked,
          createdAt: note.createdAt || new Date().toISOString(),
          updatedAt: note.updatedAt || new Date().toISOString(),
          folder: note.folder || '',
        },
        { merge: true }
      );
      count++;
    });

    // 7. Journals
    const { journals } = useJournalStore.getState();
    journals.forEach((j) => {
      const jRef = doc(db, 'users', uid, 'journals', j.id);
      batch.set(
        jRef,
        {
          date: j.date || new Date().toISOString().split('T')[0],
          mood: j.mood || 'good',
          gratitude: Array.isArray(j.gratitude) ? j.gratitude : [],
          wins: Array.isArray(j.wins) ? j.wins : [],
          challenges: Array.isArray(j.challenges) ? j.challenges : [],
          lessons: j.lessons || '',
          content: j.content || '',
          photos: Array.isArray(j.photos) ? j.photos : [],
          createdAt: j.createdAt || new Date().toISOString(),
        },
        { merge: true }
      );
      count++;
    });

    // Commit batch write
    await batch.commit();
    return {
      success: true,
      message: `Successfully synced ${count} items to Firebase Cloud Firestore!`,
      itemsSynced: count,
    };
  } catch (err: any) {
    console.error('Push to Cloud Error:', err);
    return {
      success: false,
      message: err.message || 'Failed to sync data to Cloud Firestore.',
    };
  }
};

/**
 * Pulls all data from Cloud Firestore under users/{uid} and updates local Zustand stores
 */
export const pullAllDataFromCloud = async (uid: string): Promise<SyncStatus> => {
  if (!uid || uid === 'local-user-1') {
    return { success: false, message: 'Must be logged in with Firebase to pull from cloud.' };
  }

  try {
    let totalPulled = 0;

    // Pull User Profile from Firestore
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const currentProfile = useAppStore.getState().profile;
      useAppStore.getState().updateProfile({
        name: currentProfile.name || userData.name,
        email: currentProfile.email || userData.email,
        photoURL: currentProfile.photoURL || userData.photoURL || undefined,
      });
    }

    // Pull Tasks
    const tasksSnapshot = await getDocs(collection(db, 'users', uid, 'tasks'));
    if (!tasksSnapshot.empty) {
      const cloudTasks = tasksSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as any[];
      useTaskStore.setState({ tasks: cloudTasks });
      totalPulled += cloudTasks.length;
    }

    // Pull Habits
    const habitsSnapshot = await getDocs(collection(db, 'users', uid, 'habits'));
    if (!habitsSnapshot.empty) {
      const cloudHabits = habitsSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as any[];
      useHabitStore.setState({ habits: cloudHabits });
      totalPulled += cloudHabits.length;
    }

    // Pull Routines
    const routinesSnapshot = await getDocs(collection(db, 'users', uid, 'routines'));
    if (!routinesSnapshot.empty) {
      const cloudRoutines = routinesSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as any[];
      useRoutineStore.setState({ routines: cloudRoutines });
      totalPulled += cloudRoutines.length;
    }

    // Pull Goals
    const goalsSnapshot = await getDocs(collection(db, 'users', uid, 'goals'));
    if (!goalsSnapshot.empty) {
      const cloudGoals = goalsSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as any[];
      useGoalStore.setState({ goals: cloudGoals });
      totalPulled += cloudGoals.length;
    }

    // Pull Notes
    const notesSnapshot = await getDocs(collection(db, 'users', uid, 'notes'));
    if (!notesSnapshot.empty) {
      const cloudNotes = notesSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as any[];
      useNoteStore.setState({ notes: cloudNotes });
      totalPulled += cloudNotes.length;
    }

    // Pull Journals
    const journalsSnapshot = await getDocs(collection(db, 'users', uid, 'journals'));
    if (!journalsSnapshot.empty) {
      const cloudJournals = journalsSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as any[];
      useJournalStore.setState({ journals: cloudJournals });
      totalPulled += cloudJournals.length;
    }

    // Always push local items to Cloud Firestore if Firestore has no data or local items exist
    await pushAllDataToCloud(uid);

    return {
      success: true,
      message: `Successfully synced cloud & local data (${totalPulled} cloud items retrieved).`,
      itemsSynced: totalPulled,
    };
  } catch (err: any) {
    console.error('Pull from Cloud Error:', err);
    // If pull fails, attempt push
    await pushAllDataToCloud(uid);
    return {
      success: false,
      message: err.message || 'Failed to retrieve data from Cloud Firestore.',
    };
  }
};

/**
 * Auto-Sync listener that automatically pushes local store updates to Firestore whenever stores change
 */
let debounceTimer: any = null;

export const initAutoStoreSync = (uid: string) => {
  if (!uid || uid === 'local-user-1') return () => {};

  const triggerDebouncedSync = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      pushAllDataToCloud(uid);
    }, 1000);
  };

  const unsubTask = useTaskStore.subscribe(triggerDebouncedSync);
  const unsubHabit = useHabitStore.subscribe(triggerDebouncedSync);
  const unsubRoutine = useRoutineStore.subscribe(triggerDebouncedSync);
  const unsubGoal = useGoalStore.subscribe(triggerDebouncedSync);
  const unsubNote = useNoteStore.subscribe(triggerDebouncedSync);
  const unsubJournal = useJournalStore.subscribe(triggerDebouncedSync);

  return () => {
    unsubTask();
    unsubHabit();
    unsubRoutine();
    unsubGoal();
    unsubNote();
    unsubJournal();
    if (debounceTimer) clearTimeout(debounceTimer);
  };
};
