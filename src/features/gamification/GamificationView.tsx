import React from 'react';
import { Trophy, Award, Flame, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAppStore } from '../../store/useAppStore';
import { useGamificationStore } from '../../store/useGamificationStore';

export const GamificationView: React.FC = () => {
  const { profile, addXP } = useAppStore();
  const { achievements, unlockAchievement } = useGamificationStore();

  const handleClaimUnlock = (id: string) => {
    const res = unlockAchievement(id);
    if (res.unlocked && res.achievement) {
      addXP(res.achievement.xpReward);
      // Trigger Confetti Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-600 p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-inner font-extrabold">
              🏆
            </div>
            <div>
              <span className="text-xs font-extrabold tracking-widest text-amber-200 uppercase">Gamification Status</span>
              <h2 className="text-3xl font-extrabold tracking-tight mt-0.5">Productivity Achievements</h2>
              <p className="text-xs text-indigo-100 mt-1">
                Earn XP and unlock badges by completing tasks, habit streaks, routines & focus sessions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-center px-4">
              <span className="text-xs text-indigo-200 block font-medium">Active Streak</span>
              <span className="text-2xl font-bold flex items-center gap-1.5 justify-center">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" /> {profile.streak} Days
              </span>
            </div>
            <div className="text-center px-4 border-l border-white/20">
              <span className="text-xs text-amber-200 block font-medium">Total XP</span>
              <span className="text-2xl font-bold flex items-center gap-1.5 justify-center">
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" /> {profile.xp} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Achievements Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-500" /> Achievements & Badges ({achievements.filter((a) => a.unlocked).length}/{achievements.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <Card key={ach.id} className={`p-5 relative transition-all ${ach.unlocked ? 'border-amber-500/40 bg-amber-500/5' : 'opacity-80'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md ${ach.unlocked ? 'bg-amber-400 text-slate-900 font-bold' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {ach.unlocked ? '🏆' : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ach.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> +{ach.xpReward} XP
                </span>

                {ach.unlocked ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Unlocked
                  </span>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleClaimUnlock(ach.id)}>
                    Claim Unlock
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
