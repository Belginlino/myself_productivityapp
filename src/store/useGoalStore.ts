import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GoalItem, ProjectItem } from '../types';

interface GoalProjectState {
  goals: GoalItem[];
  projects: ProjectItem[];
  
  // Goal actions
  addGoal: (goal: Omit<GoalItem, 'id' | 'progress' | 'completed' | 'createdAt'>) => GoalItem;
  updateGoal: (id: string, updates: Partial<GoalItem>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;

  // Project actions
  addProject: (project: Omit<ProjectItem, 'id' | 'taskIds' | 'createdAt'>) => ProjectItem;
  updateProject: (id: string, updates: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;
}

const initialGoals: GoalItem[] = [];
const initialProjects: ProjectItem[] = [];

export const useGoalStore = create<GoalProjectState>()(
  persist(
    (set) => ({
      goals: initialGoals,
      projects: initialProjects,

      addGoal: (goalData) => {
        const newGoal: GoalItem = {
          ...goalData,
          id: 'goal-' + Date.now(),
          progress: 0,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ goals: [newGoal, ...state.goals] }));
        return newGoal;
      },

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      toggleMilestone: (goalId, milestoneId) =>
        set((state) => ({
          goals: state.goals.map((goal) => {
            if (goal.id !== goalId) return goal;
            const updatedMilestones = goal.milestones.map((m) =>
              m.id === milestoneId ? { ...m, completed: !m.completed } : m
            );
            const completedCount = updatedMilestones.filter((m) => m.completed).length;
            const newProgress = Math.round(
              (completedCount / (updatedMilestones.length || 1)) * 100
            );

            return {
              ...goal,
              milestones: updatedMilestones,
              progress: newProgress,
              completed: newProgress === 100,
            };
          }),
        })),

      addProject: (projData) => {
        const newProject: ProjectItem = {
          ...projData,
          id: 'proj-' + Date.now(),
          taskIds: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        return newProject;
      },

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'myself-goal-store',
    }
  )
);
