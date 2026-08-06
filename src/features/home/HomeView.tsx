import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Flame,
  CheckSquare,
  Clock,
  Plus,
  Mic,
  ArrowRight,
  Sparkles,
  Calendar as CalendarIcon,
  CheckCircle2,
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { useAppStore } from '../../store/useAppStore';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { TaskCard } from '../tasks/TaskCard';

interface HomeViewProps {
  onOpenAddTask?: () => void;
  onOpenAddRoutine?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenAddTask,
  onOpenAddRoutine,
}) => {
  const { tasks } = useTaskStore();
  const { routines, streakData } = useRoutineStore();
  const { profile, toggleQuickAdd, setActiveTab } = useAppStore();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter((t) => !t.dueDate || t.dueDate === todayStr);
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed');

  // User Name
  const userName = profile.name || (profile.email ? profile.email.split('@')[0] : '') || 'User';

  // Routine Completion for today
  const completedRoutinesToday = routines.filter((r) =>
    r.completedDates.includes(todayStr)
  );
  const routineProgressPct =
    routines.length > 0
      ? Math.round((completedRoutinesToday.length / routines.length) * 100)
      : 0;

  // Time of day greeting
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  if (hour >= 17) greeting = 'Good evening';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-28"
    >
      {/* Top Banner: Greeting & Date */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-xs font-bold text-[#A8B3C7] tracking-wider uppercase">
            {format(new Date(), 'EEEE, MMMM d')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 tracking-tight">
            {greeting}, {userName}! 👋
          </h1>
        </div>

        {/* Voice Trigger Mic Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleQuickAdd(true)}
          className="w-12 h-12 rounded-2xl bg-[#C9F48A] text-[#1B2435] flex items-center justify-center shadow-glow-accent font-bold"
          title="Voice Task"
        >
          <Mic className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Routine Streak & Progress Ring Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Streak Fire Banner */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-[#23324A] to-[#1F2C42] border border-white/10 shadow-lg flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#C9F48A] uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Routine Streak
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-mono">
                {streakData.currentStreak}
              </span>
              <span className="text-sm font-semibold text-[#A8B3C7]">Days Active</span>
            </div>
            <p className="text-xs text-[#A8B3C7] mt-2">
              Best Record: <span className="text-white font-bold">{streakData.longestStreak} days</span>
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#FF5D73]/20 flex items-center justify-center text-[#FF5D73] shadow-lg">
            <Flame className="w-9 h-9 fill-[#FF5D73]" />
          </div>
        </motion.div>

        {/* Card 2: Today's Routine Completion Ring */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => setActiveTab('routines')}
          className="p-5 rounded-3xl bg-[#23324A] border border-white/10 shadow-lg flex items-center justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#37C7F4] uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" /> Daily Routines
            </div>
            <h3 className="text-xl font-bold text-white">
              {completedRoutinesToday.length}/{routines.length} Completed
            </h3>
            <p className="text-xs text-[#A8B3C7] mt-2 group-hover:text-white transition-colors flex items-center gap-1">
              View Routine Schedule <ArrowRight className="w-3.5 h-3.5" />
            </p>
          </div>

          <ProgressRing
            progress={routineProgressPct}
            size={68}
            strokeWidth={7}
            color="#37C7F4"
          />
        </motion.div>
      </div>

      {/* Task Count Summary Pill Bar */}
      <div className="p-4 rounded-3xl bg-[#23324A] border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C9F48A]/20 flex items-center justify-center text-[#C9F48A]">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {todayTasks.length} Tasks Scheduled Today
            </h4>
            <p className="text-xs text-[#A8B3C7]">
              {completedTodayTasks.length} completed, {todayTasks.length - completedTodayTasks.length} pending
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('tasks')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors"
        >
          View Timeline
        </button>
      </div>

      {/* Today's Tasks Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#C9F48A]" /> Today's Priorities
          </h3>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs font-bold text-[#C9F48A] hover:underline"
          >
            See All Tasks ({tasks.length})
          </button>
        </div>

        {todayTasks.length > 0 ? (
          <div className="space-y-3">
            {todayTasks.slice(0, 3).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-[#23324A]/40 border border-dashed border-white/10 text-center">
            <CheckCircle2 className="w-8 h-8 text-[#C9F48A] mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No tasks scheduled for today!</p>
            <p className="text-xs text-[#A8B3C7] mt-1">
              Add your first task using the floating action button below.
            </p>
          </div>
        )}
      </div>

      {/* Floating Add Action Button (Visible on desktop where BottomNav is hidden) */}
      <div className="fixed bottom-10 right-10 z-40 hidden lg:flex">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => toggleQuickAdd(true)}
          className="w-14 h-14 rounded-full bg-[#C9F48A] text-[#1B2435] flex items-center justify-center shadow-glow-accent font-bold"
          aria-label="Create task or routine"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </motion.button>
      </div>
    </motion.div>
  );
};
