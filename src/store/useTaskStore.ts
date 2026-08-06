import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskItem } from '../types';
import {
  scheduleTaskNotification,
  cancelTaskNotification,
} from '../services/notificationService';
import { auth } from '../firebase/config';
import { saveTaskToCloud, deleteTaskFromCloud } from '../firebase/syncService';

interface TaskState {
  tasks: TaskItem[];

  // Actions
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => TaskItem;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (taskData) => {
        const newTask: TaskItem = {
          ...taskData,
          id: 'task-' + Date.now(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({ tasks: [newTask, ...state.tasks] }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          saveTaskToCloud(uid, newTask);
        }

        if (newTask.reminder && newTask.dueDate) {
          scheduleTaskNotification(newTask);
        }

        return newTask;
      },

      updateTask: (id, updates) => {
        const existing = get().tasks.find((t) => t.id === id);
        if (!existing) return;

        const updatedTask: TaskItem = {
          ...existing,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
        }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          saveTaskToCloud(uid, updatedTask);
        }

        cancelTaskNotification(id);
        if (updatedTask.status === 'pending' && updatedTask.reminder && updatedTask.dueDate) {
          scheduleTaskNotification(updatedTask);
        }
      },

      deleteTask: (id) => {
        cancelTaskNotification(id);

        const uid = auth.currentUser?.uid;
        if (uid) {
          deleteTaskFromCloud(uid, id);
        }

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      toggleTaskComplete: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const isNowCompleted = task.status !== 'completed';
        const newStatus = isNowCompleted ? 'completed' : 'pending';

        const updatedTask: TaskItem = {
          ...task,
          status: newStatus,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          saveTaskToCloud(uid, updatedTask);
        }

        if (isNowCompleted) {
          cancelTaskNotification(id);
        } else if (updatedTask.reminder && updatedTask.dueDate) {
          scheduleTaskNotification(updatedTask);
        }
      },
    }),
    {
      name: 'myself-task-store',
    }
  )
);

