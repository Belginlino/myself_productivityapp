import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Flame,
  Trophy,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Calendar as CalendarIcon,
  Bell,
  BellOff,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  Zap,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useRoutineStore } from '../../store/useRoutineStore';
import { RoutineItem } from '../../types';
import { requestNotificationPermissions } from '../../services/notificationService';

export const RoutineView: React.FC = () => {
  const {
    routines,
    streakData,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    reorderRoutines,
    toggleRoutineCompletion,
  } = useRoutineStore();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [repeatEveryDay, setRepeatEveryDay] = useState(true);
  const [reminder, setReminder] = useState(true);

  // Calendar View Month State
  const [viewDate, setViewDate] = useState(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  const sortedRoutines = [...routines].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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

  // GitHub Contribution Graph Style Calendar Generator
  const renderCalendarHistory = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const paddingCells = Array.from({ length: firstDayOfWeek }, (_, i) => i);

    let completedDaysCount = 0;

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const isCompleted = streakData.calendarHistory[dayStr] === true;
      if (isCompleted) completedDaysCount++;

      return {
        dayNum,
        dayStr,
        isCompleted,
        isToday: dayStr === todayStr,
      };
    });

    const handlePrevMonth = () => {
      setViewDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
      setViewDate(new Date(year, month + 1, 1));
    };

    const handleTodayReset = () => {
      setViewDate(new Date());
    };

    return (
      <Card className="p-6 sm:p-7 space-y-6">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold border border-amber-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {monthName} {year}
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                {completedDaysCount} of {daysInMonth} streak days completed ({Math.round((completedDaysCount / daysInMonth) * 100)}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleTodayReset}
              className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7-Day Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span
              key={d}
              className="text-[11px] font-extrabold text-slate-400 dark:text-neutral-500 uppercase tracking-wider py-1"
            >
              {d}
            </span>
          ))}

          {/* Padding */}
          {paddingCells.map((_, idx) => (
            <div key={`pad-${idx}`} className="h-11 sm:h-12" />
          ))}

          {/* Days */}
          {daysArray.map((day) => (
            <motion.div
              key={day.dayStr}
              whileHover={{ scale: 1.08 }}
              className={`h-11 sm:h-12 rounded-2xl text-xs font-black flex flex-col items-center justify-center relative transition-all ${
                day.isCompleted
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-glow-amber'
                  : day.isToday
                  ? 'border-2 border-amber-500 text-slate-900 dark:text-white bg-amber-500/10 font-black'
                  : 'bg-slate-100/70 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10'
              }`}
            >
              <span>{day.dayNum}</span>
              {day.isCompleted && (
                <span className="text-[9px] mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-3 pt-2 text-[11px] font-bold text-slate-500 dark:text-neutral-400">
          <span>Less</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-lg bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/15" />
            <span className="w-3.5 h-3.5 rounded-lg bg-amber-500/30 border border-amber-500/40" />
            <span className="w-3.5 h-3.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white" />
          </div>
          <span>Completed</span>
        </div>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 pb-16"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold border border-amber-500/20 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            Daily Routines & Streaks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1 font-medium">
            Build consistency with daily habits. Complete all items every day to extend your streak!
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
          className="shadow-glow-slate"
        >
          Add Routine
        </Button>
      </div>

      {/* Streak Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="p-6 flex items-center gap-5">
          <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 shadow-glow-amber">
            <Flame className="w-8 h-8 fill-amber-500 animate-pulseGlow" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 dark:text-neutral-400 uppercase tracking-widest">
              Current Streak
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {streakData.currentStreak}{' '}
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                {streakData.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </h3>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-5">
          <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 dark:text-neutral-400 uppercase tracking-widest">
              Longest Streak
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {streakData.longestStreak}{' '}
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                {streakData.longestStreak === 1 ? 'day' : 'days'}
              </span>
            </h3>
          </div>
        </Card>
      </div>

      {/* Routines List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-400 dark:text-neutral-400 uppercase tracking-widest px-1">
            Daily Habits ({sortedRoutines.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
            Complete all routines to level up your streak
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {sortedRoutines.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-12 text-center border-dashed space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">No Routines Configured</h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                    Add habit goals like "Morning Workout", "Read 30 mins", or "Meditation".
                  </p>
                </div>
                <Button
                  variant="secondary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={openCreateModal}
                  className="mt-2 text-xs"
                >
                  Create First Routine
                </Button>
              </Card>
            </motion.div>
          ) : (
            sortedRoutines.map((routine, idx) => {
              const isChecked = routine.completedDates.includes(todayStr);
              return (
                <motion.div
                  key={routine.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`p-5 flex items-center justify-between gap-4 transition-all group ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20 dark:border-emerald-800/40'
                        : 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => toggleRoutineCompletion(routine.id, todayStr)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-400 dark:border-white/30 hover:border-slate-900 dark:hover:border-white'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </motion.button>

                      <div className="min-w-0">
                        <h4
                          className={`text-sm font-extrabold truncate ${
                            isChecked
                              ? 'line-through text-slate-400 dark:text-neutral-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {routine.title}
                        </h4>

                        <div className="flex items-center gap-2.5 mt-1">
                          <span className="text-[11px] font-mono font-extrabold text-slate-800 dark:text-slate-200 bg-slate-200/80 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-white/15">
                            {routine.time}
                          </span>
                          {routine.reminder ? (
                            <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 flex items-center gap-1">
                              <Bell className="w-3 h-3 text-indigo-500" /> Reminder
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 dark:text-neutral-500 flex items-center gap-1">
                              <BellOff className="w-3 h-3" /> Silent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions & Reordering */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        disabled={idx === 0}
                        onClick={() => reorderRoutines(idx, idx - 1)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        disabled={idx === sortedRoutines.length - 1}
                        onClick={() => reorderRoutines(idx, idx + 1)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(routine)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                        title="Edit routine"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteRoutine(routine.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete routine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* GitHub Style Calendar History */}
      {renderCalendarHistory()}

      {/* Create / Edit Routine Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoutineId ? 'Edit Routine' : 'Create Daily Routine'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
              Routine Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Morning Meditation, Code 1hr..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
              Scheduled Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Options */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-slate-900 dark:text-white" />
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">Repeat Every Day</p>
              </div>
              <input
                type="checkbox"
                checked={repeatEveryDay}
                onChange={(e) => setRepeatEveryDay(e.target.checked)}
                className="w-5 h-5 rounded-full border-slate-400 dark:border-white/30 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-900 dark:text-white" />
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">Scheduled Notification</p>
              </div>
              <input
                type="checkbox"
                checked={reminder}
                onChange={(e) => setReminder(e.target.checked)}
                className="w-5 h-5 rounded-full border-slate-400 dark:border-white/30 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingRoutineId ? 'Update Routine' : 'Save Routine'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
