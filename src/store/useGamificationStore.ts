import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Achievement } from '../types';

interface GamificationState {
  achievements: Achievement[];
  unlockAchievement: (id: string) => { unlocked: boolean; achievement?: Achievement };
}

const initialAchievements: Achievement[] = [
  {
    id: 'ach-1',
    title: 'First Step',
    description: 'Complete your very first task in Myself',
    icon: 'CheckCircle2',
    xpReward: 50,
    coinReward: 20,
    unlocked: false,
  },
  {
    id: 'ach-2',
    title: 'Streak Master',
    description: 'Maintain a 5-day habit streak',
    icon: 'Flame',
    xpReward: 150,
    coinReward: 50,
    unlocked: false,
  },
  {
    id: 'ach-3',
    title: 'Deep Focus Ninja',
    description: 'Complete 5 Pomodoro focus sessions',
    icon: 'Timer',
    xpReward: 200,
    coinReward: 75,
    unlocked: false,
  },
  {
    id: 'ach-4',
    title: 'Knowledge Architect',
    description: 'Write 5 markdown notes or journal entries',
    icon: 'FileText',
    xpReward: 100,
    coinReward: 30,
    unlocked: false,
  },
  {
    id: 'ach-5',
    title: 'Polyglot Coder',
    description: 'Log 10 hours of coding sessions across projects',
    icon: 'Code2',
    xpReward: 300,
    coinReward: 100,
    unlocked: false,
  },
  {
    id: 'ach-6',
    title: 'Goal Crusher',
    description: 'Achieve 100% progress on any major Goal',
    icon: 'Trophy',
    xpReward: 500,
    coinReward: 200,
    unlocked: false,
  },
];

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      achievements: initialAchievements,

      unlockAchievement: (id) => {
        const achievement = get().achievements.find((a) => a.id === id);
        if (!achievement || achievement.unlocked) return { unlocked: false };

        let unlockedAch: Achievement | undefined;

        set((state) => ({
          achievements: state.achievements.map((a) => {
            if (a.id === id) {
              unlockedAch = { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
              return unlockedAch;
            }
            return a;
          }),
        }));

        return { unlocked: true, achievement: unlockedAch };
      },
    }),
    {
      name: 'myself-gamification-store',
    }
  )
);
