import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  Plus,
  Flame,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Zap,
  Check,
  Edit2,
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
  const completedTasksToday = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt?.startsWith(todayStr)
  );
  const totalTasksToday = pendingTasks.length + completedTasksToday.length;

  const completedRoutinesToday = routines.filter((r) => r.completedDates.includes(todayStr));
  const totalRoutines = routines.length;

  const routinePercentage =
    totalRoutines > 0 ? Math.round((completedRoutinesToday.length / totalRoutines) * 100) : 0;

  // Combined overall completion score for Hero
  const totalItems = totalTasksToday + totalRoutines;
  const completedItems = completedTasksToday.length + completedRoutinesToday.length;
  const overallPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // SVG Circular Progress calculation
  const ringRadius = 42;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (overallPercentage / 100) * ringCircumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 pb-16"
    >
      {/* 🌟 HERO CARD: Dominant Focus & Progress Dashboard */}
      <div className="relative overflow-hidden rounded-4xl bg-slate-900 dark:bg-gradient-to-br dark:from-slate-900 dark:via-zinc-950 dark:to-slate-950 border border-slate-800 dark:border-white/15 p-7 sm:p-9 shadow-2xl shadow-slate-950/40 text-white">
        {/* Soft Radial Ambient Aura */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Left Column: Greeting & Status */}
          <div className="space-y-4 max-w-xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-slate-200 border border-white/15">
                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                <span>{todayFormatted}</span>
              </div>

              {/* Streak Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 backdrop-blur-md text-amber-300 text-xs font-black shadow-glow-amber">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulseGlow" />
                <span>
                  {streakData.currentStreak} {streakData.currentStreak === 1 ? 'Day' : 'Days'} Streak
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {timeGreeting}, {displayName}
              </h1>
              <p className="text-sm text-slate-300 dark:text-neutral-400 mt-2 font-medium leading-relaxed">
                {overallPercentage === 100
                  ? "🎉 Phenomenal work! You've accomplished all your routines & tasks today."
                  : overallPercentage > 50
                  ? "⚡ You're over halfway there! Keep up the momentum to secure your streak."
                  : 'Focus on your top priorities today and keep your consistency unbroken.'}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={onOpenAddTask}
                className="shadow-glow-slate"
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

          {/* Right Column: Interactive Progress Ring */}
          <div className="flex items-center gap-6 shrink-0 self-center md:self-auto bg-white/5 dark:bg-white/[0.04] p-5 rounded-3xl border border-white/10 backdrop-blur-xl">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  className="text-white/10 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Animated Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  className="text-emerald-400 stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">{overallPercentage}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Completed
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>
                  Routines: <strong className="text-white">{completedRoutinesToday.length}/{totalRoutines}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <span>
                  Tasks Done: <strong className="text-white">{completedTasksToday.length}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending: {pendingTasks.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 SUMMARY METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1: Pending Tasks */}
        <Card className="p-5 flex items-center gap-4 hover:border-slate-300 dark:hover:border-white/20 transition-all">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 dark:text-neutral-400 uppercase tracking-widest">
              Pending Tasks
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {pendingTasks.length}{' '}
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">active</span>
            </h3>
          </div>
        </Card>

        {/* Metric 2: Daily Routine Progress */}
        <Card className="p-5 flex items-center gap-4 hover:border-slate-300 dark:hover:border-white/20 transition-all">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-neutral-400 uppercase tracking-widest">
                Daily Habit Score
              </p>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{routinePercentage}%</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {completedRoutinesToday.length}/{totalRoutines}{' '}
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">habits</span>
            </h3>
          </div>
        </Card>

        {/* Metric 3: Active Streak */}
        <Card className="p-5 flex items-center gap-4 hover:border-slate-300 dark:hover:border-white/20 transition-all">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 dark:text-neutral-400 uppercase tracking-widest">
              Current Streak
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {streakData.currentStreak}{' '}
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                {streakData.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </h3>
          </div>
        </Card>
      </div>

      {/* 🚀 WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Active Tasks List */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Active Tasks</h2>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-bold text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 group"
            >
              View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {pendingTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10 space-y-3"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">All Tasks Completed!</h4>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                      You have zero pending tasks remaining for today.
                    </p>
                  </div>
                  <button
                    onClick={onOpenAddTask}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Task
                  </button>
                </motion.div>
              ) : (
                pendingTasks.slice(0, 5).map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => toggleTaskComplete(task.id)}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] cursor-pointer transition-all flex items-center justify-between gap-3.5 group shadow-sm"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskComplete(task.id);
                        }}
                        className="mt-0.5 w-5.5 h-5.5 rounded-lg border-2 border-slate-400 dark:border-white/40 group-hover:border-slate-900 dark:group-hover:border-white flex items-center justify-center transition-all shrink-0"
                      >
                        <Check className="w-3.5 h-3.5 text-transparent stroke-[3]" />
                      </motion.button>
                      <div className="min-w-0 space-y-1">
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
                          <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                            Due: {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('tasks');
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors shrink-0"
                      title="Edit task in Tasks tab"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Right Column: Daily Routine Tracker */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Daily Routines</h2>
            </div>
            <button
              onClick={() => setActiveTab('routines')}
              className="text-xs font-bold text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 group"
            >
              View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {routines.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10 space-y-3"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Routines Set</h4>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                      Build daily habits like "Morning Meditation" or "Read 20 pages".
                    </p>
                  </div>
                  <button
                    onClick={onOpenAddRoutine}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Routine
                  </button>
                </motion.div>
              ) : (
                routines.map((routine) => {
                  const isChecked = routine.completedDates.includes(todayStr);
                  return (
                    <motion.div
                      key={routine.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => toggleRoutineCompletion(routine.id, todayStr)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20 dark:border-emerald-800/40'
                          : 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-400 dark:border-white/30 hover:border-slate-900 dark:hover:border-white'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                        </motion.button>
                        <h4
                          className={`text-xs font-bold truncate ${
                            isChecked
                              ? 'line-through text-slate-400 dark:text-neutral-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {routine.title}
                        </h4>
                      </div>

                      <span className="text-[11px] font-mono font-extrabold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/15 shrink-0">
                        {routine.time}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
