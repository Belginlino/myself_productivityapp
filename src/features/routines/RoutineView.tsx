import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Flame,
  Trophy,
  CheckCircle2,
  Bell,
  BellOff,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  ChevronLeft,
} from 'lucide-react';
import { useRoutineStore } from '../../store/useRoutineStore';
import { useAppStore } from '../../store/useAppStore';
import { RoutineItem } from '../../types';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { requestNotificationPermissions } from '../../services/notificationService';
import { TimeInput12 } from '../../components/common/TimeInput12';
import { format12Hour } from '../../utils/timeUtils';

export const RoutineView: React.FC = () => {
  const {
    routines,
    streakData,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    toggleRoutineCompletion,
  } = useRoutineStore();
  const { setActiveTab } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [repeatEveryDay, setRepeatEveryDay] = useState(true);
  const [reminder, setReminder] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  const completedTodayCount = routines.filter((r) =>
    r.completedDates.includes(todayStr)
  ).length;
  const routineProgressPct =
    routines.length > 0 ? Math.round((completedTodayCount / routines.length) * 100) : 0;

  // Helper to categorize routine into Morning / Afternoon / Evening / Night
  const getRoutineCategory = (timeStr: string) => {
    const parts = timeStr.split(':');
    const hour = parseInt(parts[0], 10) || 8;
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const categories = [
    { key: 'morning', label: 'Morning Routine', icon: Sunrise, color: '#C9F48A' },
    { key: 'afternoon', label: 'Afternoon Habits', icon: Sun, color: '#37C7F4' },
    { key: 'evening', label: 'Evening Routine', icon: Sunset, color: '#D9C8F2' },
    { key: 'night', label: 'Night Reset', icon: Moon, color: '#76E56A' },
  ];

  const openCreateModal = () => {
    setEditingRoutineId(null);
    setTitle('');
    setTime('08:00');
    setRepeatEveryDay(true);
    setReminder(true);
    setIsModalOpen(true);
  };

  const openEditModal = (routine: RoutineItem) => {
    setEditingRoutineId(routine.id);
    setTitle(routine.title);
    setTime(routine.time);
    setRepeatEveryDay(routine.repeatEveryDay);
    setReminder(routine.reminder);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (reminder) {
      await requestNotificationPermissions();
    }

    if (editingRoutineId) {
      updateRoutine(editingRoutineId, {
        title: title.trim(),
        time,
        repeatEveryDay,
        reminder,
      });
    } else {
      addRoutine({
        title: title.trim(),
        time,
        repeatEveryDay,
        reminder,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-28"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setActiveTab('home')}
          className="p-2.5 rounded-full bg-[#23324A] text-white/80 hover:text-white border border-white/5 transition-colors"
          aria-label="Back to home"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-xl font-bold text-white tracking-wide">Daily Routines</h1>

        <button
          onClick={openCreateModal}
          className="p-2.5 rounded-full bg-[#C9F48A] text-[#1B2435] shadow-glow-accent font-bold hover:bg-[#b1e06d] transition-colors"
          aria-label="Add routine"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Routine Progress & Streak Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Progress Card */}
        <div className="p-5 rounded-3xl bg-[#23324A] border border-white/10 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#C9F48A] uppercase tracking-wider">
              Today's Completion
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {completedTodayCount} of {routines.length} Done
            </h3>
            <p className="text-xs text-[#A8B3C7] mt-1">
              Keep going to extend your streak!
            </p>
          </div>
          <ProgressRing progress={routineProgressPct} size={64} strokeWidth={6} color="#C9F48A" />
        </div>

        {/* Streak Stats Card */}
        <div className="p-5 rounded-3xl bg-[#23324A] border border-white/10 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#FF5D73] uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-4 h-4 fill-[#FF5D73]" /> Current Streak
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">
              {streakData.currentStreak} Days
            </h3>
            <p className="text-xs text-[#A8B3C7] mt-1 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#C9F48A]" /> Longest: {streakData.longestStreak} days
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-[#FF5D73]/15 flex items-center justify-center text-[#FF5D73]">
            <Flame className="w-8 h-8 fill-[#FF5D73]" />
          </div>
        </div>
      </div>

      {/* Routine Timeline Grouped by Category */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const categoryRoutines = routines.filter(
            (r) => getRoutineCategory(r.time) === cat.key
          );
          const CatIcon = cat.icon;

          return (
            <div key={cat.key} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-2.5 px-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  <CatIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">{cat.label}</h3>
                <span className="text-xs font-mono font-bold text-[#A8B3C7]">
                  ({categoryRoutines.length})
                </span>
              </div>

              {/* Routine Cards List */}
              {categoryRoutines.length > 0 ? (
                <div className="space-y-3">
                  {categoryRoutines.map((routine) => {
                    const isDone = routine.completedDates.includes(todayStr);

                    return (
                      <motion.div
                        key={routine.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          isDone
                            ? 'bg-[#76E56A]/10 border-[#76E56A]/30 text-white'
                            : 'bg-[#23324A] border-white/5 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Checkbox Toggle */}
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggleRoutineCompletion(routine.id, todayStr)}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                              isDone
                                ? 'bg-[#76E56A] text-[#1B2435]'
                                : 'border-2 border-white/30 hover:border-white text-transparent'
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                          </motion.button>

                          <div className="min-w-0">
                            <h4
                              className={`text-sm font-bold truncate ${
                                isDone ? 'line-through opacity-70' : 'text-white'
                              }`}
                            >
                              {routine.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-[#A8B3C7]">
                              <span className="font-mono font-bold text-white/90">
                                {format12Hour(routine.time)}
                              </span>
                              {routine.reminder && (
                                <span className="flex items-center gap-1 text-[11px] text-[#37C7F4]">
                                  <Bell className="w-3 h-3" /> Reminder
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditModal(routine)}
                            className="p-2 rounded-xl text-[#A8B3C7] hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRoutine(routine.id)}
                            className="p-2 rounded-xl text-[#A8B3C7] hover:text-[#FF5D73] hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#23324A]/40 border border-dashed border-white/5 text-xs text-[#A8B3C7]/60 italic">
                  No routines set for this block
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create / Edit Routine Bottom Sheet */}
      <BottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoutineId ? 'Edit Routine' : 'Create Routine'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#A8B3C7] uppercase tracking-wider mb-2">
              Routine Title <span className="text-[#FF5D73]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Morning Meditation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-[#1B2435] text-sm font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9F48A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A8B3C7] uppercase tracking-wider mb-2">
              Time
            </label>
            <TimeInput12 value={time} onChange={setTime} accentColor="#C9F48A" />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1B2435] border border-white/10">
            <span className="text-xs font-bold text-white">Daily Notification</span>
            <button
              type="button"
              onClick={() => setReminder(!reminder)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                reminder ? 'bg-[#C9F48A]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#1B2435] transition-transform ${
                  reminder ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-bold text-xs shadow-glow-accent hover:bg-[#b1e06d] transition-colors"
            >
              Save Routine
            </button>
          </div>
        </form>
      </BottomSheet>
    </motion.div>
  );
};
