import { LocalNotifications } from '@capacitor/local-notifications';
import { TaskItem, RoutineItem } from '../types';

/**
 * Sound & Vibration helper
 */
export const playNotificationSoundAndVibrate = () => {
  // Vibration
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([300, 150, 300]);
    } catch {
      // Ignore vibration errors
    }
  }

  // Web Audio synth chime sound
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (err) {
    console.warn('Audio playback not allowed or supported', err);
  }
};

/**
 * Converts a string ID (e.g. "task-1234567") to a unique 32-bit integer for Capacitor Notifications
 */
const hashStringToInteger = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const status = await LocalNotifications.requestPermissions();
    if (status.display === 'granted') return true;
  } catch {
    // Fallback to browser Notification API
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
  }
  return false;
};

export const scheduleTaskNotification = async (task: TaskItem) => {
  if (!task.reminder || !task.dueDate) return;

  const dateTimeStr = task.dueTime ? `${task.dueDate}T${task.dueTime}:00` : `${task.dueDate}T09:00:00`;
  const scheduledTime = new Date(dateTimeStr);

  if (isNaN(scheduledTime.getTime()) || scheduledTime.getTime() <= Date.now()) {
    return; // Don't schedule past events
  }

  const notifId = hashStringToInteger(`task-${task.id}`);

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notifId,
          title: `Task Deadline: ${task.title}`,
          body: task.description || 'Your task deadline has arrived.',
          schedule: { at: scheduledTime },
          sound: 'res://raw/notification_sound',
          actionTypeId: '',
          extra: { taskId: task.id, type: 'task' },
        },
      ],
    });
  } catch (err) {
    console.warn('Capacitor LocalNotifications schedule fallback:', err);
    // Set a timeout for web fallback if page remains open
    const delay = scheduledTime.getTime() - Date.now();
    if (delay > 0 && delay < 86400000) {
      setTimeout(() => {
        playNotificationSoundAndVibrate();
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`Task Deadline: ${task.title}`, {
            body: task.description || 'Your task deadline has arrived.',
          });
        }
      }, delay);
    }
  }
};

export const cancelTaskNotification = async (taskId: string) => {
  const notifId = hashStringToInteger(`task-${taskId}`);
  try {
    await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
  } catch {
    // Silent catch
  }
};

export const scheduleRoutineNotification = async (routine: RoutineItem) => {
  if (!routine.reminder || !routine.time) return;

  const [hours, minutes] = routine.time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  if (scheduledTime.getTime() <= now.getTime()) {
    // Schedule for tomorrow if time passed today
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const notifId = hashStringToInteger(`routine-${routine.id}`);

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notifId,
          title: `Daily Routine: ${routine.title}`,
          body: `It's time for your routine (${routine.time}).`,
          schedule: { at: scheduledTime, repeats: true },
          sound: 'res://raw/notification_sound',
          extra: { routineId: routine.id, type: 'routine' },
        },
      ],
    });
  } catch (err) {
    console.warn('Capacitor Routine LocalNotification fallback:', err);
  }
};

export const cancelRoutineNotification = async (routineId: string) => {
  const notifId = hashStringToInteger(`routine-${routineId}`);
  try {
    await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
  } catch {
    // Silent catch
  }
};
