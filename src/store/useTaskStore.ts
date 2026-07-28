import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskItem, TaskStatus, PriorityLevel } from '../types';

interface TaskState {
  tasks: TaskItem[];
  searchQuery: string;
  selectedLabel: string | null;
  selectedPriority: PriorityLevel | 'all';
  selectedStatus: TaskStatus | 'all';
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedLabel: (label: string | null) => void;
  setSelectedPriority: (priority: PriorityLevel | 'all') => void;
  setSelectedStatus: (status: TaskStatus | 'all') => void;
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) => TaskItem;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  moveTaskStatus: (id: string, status: TaskStatus) => void;
}

const initialTasks: TaskItem[] = [];

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      searchQuery: '',
      selectedLabel: null,
      selectedPriority: 'all',
      selectedStatus: 'all',

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedLabel: (label) => set({ selectedLabel: label }),
      setSelectedPriority: (priority) => set({ selectedPriority: priority }),
      setSelectedStatus: (status) => set({ selectedStatus: status }),

      addTask: (taskData) => {
        const newTask: TaskItem = {
          ...taskData,
          id: 'task-' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return newTask;
      },

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      toggleTaskComplete: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const isNowCompleted = task.status !== 'completed';
        const newStatus: TaskStatus = isNowCompleted ? 'completed' : 'pending';

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: newStatus,
                  completedAt: isNowCompleted ? new Date().toISOString() : undefined,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      toggleSubtask: (taskId, subtaskId) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const updatedSubtasks = t.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            );
            return { ...t, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() };
          }),
        })),

      addSubtask: (taskId, title) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const newSub: TaskItem['subtasks'][number] = {
              id: 'sub-' + Date.now(),
              title,
              completed: false,
            };
            return {
              ...t,
              subtasks: [...t.subtasks, newSub],
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      moveTaskStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completedAt: status === 'completed' ? new Date().toISOString() : undefined,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),
    }),
    {
      name: 'myself-task-store',
    }
  )
);
