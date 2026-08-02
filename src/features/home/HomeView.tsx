import React from 'react';
import {
  CheckSquare,
  Clock,
  Plus,
  Flame,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { VoiceNotePlayer } from '../../components/common/VoiceNotePlayer';
import { useAppStore } from '../../store/useAppStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useRoutineStore } from '../../store/useRoutineStore';

interface HomeViewProps {
  onOpenAddTask: () => void;
  onOpenAddRoutine: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenAddTask, onOpenAddRoutine }) => {
  const { profile, setActiveTab } = useAppStore();
  const { tasks, toggleTaskComplete } = useTaskStore();
  const { routines, streakData, toggleRoutineCompletion } = useRoutineStore();

  const todayStr = new Date().toISOString().split('T')[0];

  // Date Formatting
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Greeting Logic
  const currentHour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = 'Good Afternoon';
  } else if (currentHour >= 17) {
    timeGreeting = 'Good Evening';
  }

  const displayName = profile.name ? profile.name.split(' ')[0] : 'Friend';

  // Metrics Logic
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedRoutinesToday = routines.filter((r) => r.completedDates.includes(todayStr));
  const totalRoutines = routines.length;
  const routinePercentage =
    totalRoutines > 0 ? Math.round((completedRoutinesToday.length / totalRoutines) * 100) : 0;

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Top Banner - Hero Card */}
      <div className="relative overflow-hidden rounded-4xl bg-gradient-to-r from-slate-900 via-black to-slate-950 border border-slate-800 dark:border-white/15 p-8 sm:p-10 shadow-xl shadow-black/20 text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-white/[0.05] blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-neutral-300 border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>{todayFormatted}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {timeGreeting}, {displayName}
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl leading-relaxed">
              Stay focused, accomplish your priorities, and keep your daily streak alive.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenAddTask}
            >
              Add Task
            </Button>
            <Button
              variant="secondary"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenAddRoutine}
            >
              Add Routine
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1: Pending Tasks */}
        <Card className="p-6 flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest">
              Today's Tasks
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {pendingTasks.length}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-neutral-400">pending</span>
            </h3>
          </div>
        </Card>

        {/* Metric 2: Routine Progress */}
        <Card className="p-6 flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest">
                Routine
              </p>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{routinePercentage}%</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {completedRoutinesToday.length} / {totalRoutines}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-neutral-400">done</span>
            </h3>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-500"
                style={{ width: `${routinePercentage}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Metric 3: Routine Streak */}
        <Card className="p-6 flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 shrink-0">
            <Flame className="w-6 h-6 fill-slate-900 dark:fill-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest">
              Current Streak
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {streakData.currentStreak}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-neutral-400">
                {streakData.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </h3>
          </div>
        </Card>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Tasks */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-5 h-5 text-slate-900 dark:text-white" />
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Active Tasks</h2>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-bold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-9 h-9 text-slate-400 dark:text-neutral-500 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
                  No pending tasks today.
                </p>
              </div>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskComplete(task.id)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                      className="mt-0.5 w-5 h-5 rounded-full border-2 border-slate-400 dark:border-white/40 hover:border-slate-900 dark:hover:border-white flex items-center justify-center transition-colors shrink-0"
                    >
                      <Circle className="w-4 h-4 text-transparent" />
                    </button>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {task.title}
                      </h3>
                      {task.voiceNoteUrl && (
                        <div className="pt-1">
                          <VoiceNotePlayer
                            audioUrl={task.voiceNoteUrl}
                            duration={task.voiceNoteDuration}
                          />
                        </div>
                      )}
                      {task.dueDate && (
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                          Due: {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right: Daily Routine Tracker */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-slate-900 dark:text-white" />
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Daily Routine</h2>
            </div>
            <button
              onClick={() => setActiveTab('routines')}
              className="text-xs font-bold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {routines.length === 0 ? (
              <div className="text-center py-10">
                <Clock className="w-9 h-9 text-slate-400 dark:text-neutral-500 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
                  No routines added yet.
                </p>
                <button
                  onClick={onOpenAddRoutine}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Routine
                </button>
              </div>
            ) : (
              routines.map((routine) => {
                const isChecked = routine.completedDates.includes(todayStr);
                return (
                  <div
                    key={routine.id}
                    onClick={() => toggleRoutineCompletion(routine.id, todayStr)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-slate-200/60 dark:bg-white/10 border-slate-300 dark:border-white/25'
                        : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded-full border-slate-400 dark:border-white/30 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <h4
                          className={`text-xs font-bold ${
                            isChecked
                              ? 'line-through text-slate-400 dark:text-neutral-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {routine.title}
                        </h4>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-300 dark:border-white/15">
                      {routine.time}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
