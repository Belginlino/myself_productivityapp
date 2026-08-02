import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { useAppStore } from '../store/useAppStore';
import { useTaskStore } from '../store/useTaskStore';
import { useRoutineStore } from '../store/useRoutineStore';

export interface SyncStatus {
  success: boolean;
  message: string;
  itemsSynced?: number;
}

/**
 * Pushes all local state from Zustand stores to Cloud Firestore under users/{uid}
 * Collections: users, tasks, routines, streaks
 */
export const pushAllDataToCloud = async (uid: string): Promise<SyncStatus> => {
  if (!uid || uid === 'local-user-1') {
    return { success: false, message: 'Must be logged in with Firebase to sync to cloud.' };
  }

  try {
    const batch = writeBatch(db);
    let count = 0;

    // 1. User Profile & Settings
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
        notificationsEnabled: !!settings.notificationsEnabled,
        reminderSound: !!settings.reminderSound,
        vibration: !!settings.vibration,
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
        status: task.status || 'pending',
        reminder: !!task.reminder,
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: task.updatedAt || new Date().toISOString(),
      };
      if (task.description) payload.description = task.description;
      if (task.dueDate) payload.dueDate = task.dueDate;
      if (task.dueTime) payload.dueTime = task.dueTime;
      if (task.voiceNote) payload.voiceNote = task.voiceNote;
      if (task.completedAt) payload.completedAt = task.completedAt;

      batch.set(taskRef, payload, { merge: true });
      count++;
    });

    // 3. Routines
    const { routines, streakData } = useRoutineStore.getState();
    routines.forEach((routine) => {
      const routineRef = doc(db, 'users', uid, 'routines', routine.id);
      batch.set(
        routineRef,
        {
          title: routine.title,
          time: routine.time || '08:00',
          repeatEveryDay: routine.repeatEveryDay ?? true,
          reminder: !!routine.reminder,
          completedDates: Array.isArray(routine.completedDates) ? routine.completedDates : [],
          order: routine.order ?? 0,
          createdAt: routine.createdAt || new Date().toISOString(),
        },
        { merge: true }
      );
      count++;
    });

    // 4. Streaks
    const streakRef = doc(db, 'users', uid, 'streaks', 'main');
    batch.set(
      streakRef,
      {
        currentStreak: streakData.currentStreak || 0,
        longestStreak: streakData.longestStreak || 0,
        calendarHistory: streakData.calendarHistory || {},
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    count++;

    await batch.commit();
    return {
      success: true,
      message: `Successfully synced ${count} items to Cloud Firestore!`,
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
 * Pulls data from Cloud Firestore under users/{uid} and updates local Zustand stores
 */
export const pullAllDataFromCloud = async (uid: string): Promise<SyncStatus> => {
  if (!uid || uid === 'local-user-1') {
    return { success: false, message: 'Must be logged in with Firebase to pull from cloud.' };
  }

  try {
    let totalPulled = 0;

    // Pull User Profile
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

    // Pull Streaks
    const streakDocRef = doc(db, 'users', uid, 'streaks', 'main');
    const streakSnap = await getDoc(streakDocRef);
    if (streakSnap.exists()) {
      const streakData = streakSnap.data() as any;
      useRoutineStore.setState((state) => ({
        streakData: {
          currentStreak: streakData.currentStreak || 0,
          longestStreak: streakData.longestStreak || 0,
          calendarHistory: streakData.calendarHistory || {},
        },
      }));
    }

    useRoutineStore.getState().recalculateStreaks();
    await pushAllDataToCloud(uid);

    return {
      success: true,
      message: `Successfully synced cloud & local data (${totalPulled} cloud items retrieved).`,
      itemsSynced: totalPulled,
    };
  } catch (err: any) {
    console.error('Pull from Cloud Error:', err);
    await pushAllDataToCloud(uid);
    return {
      success: false,
      message: err.message || 'Failed to retrieve data from Cloud Firestore.',
    };
  }
};

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
  const unsubRoutine = useRoutineStore.subscribe(triggerDebouncedSync);

  return () => {
    unsubTask();
    unsubRoutine();
    if (debounceTimer) clearTimeout(debounceTimer);
  };
};
