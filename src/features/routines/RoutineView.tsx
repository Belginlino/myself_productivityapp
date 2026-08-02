import React, { useState } from 'react';
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

  // Calendar History Generator for Current Month
  const renderCalendarHistory = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = now.toLocaleString('default', { month: 'long' });

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      return {
        dayNum,
        dayStr,
        isCompleted: streakData.calendarHistory[dayStr] === true,
        isToday: dayStr === todayStr,
      };
    });

    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-slate-900 dark:text-white" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Calendar History - {monthName} {year}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d} className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
              {d}
            </span>
          ))}

          {daysArray.map((day) => (
            <div
              key={day.dayStr}
              className={`p-2.5 rounded-2xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
                day.isCompleted
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold shadow-md'
                  : day.isToday
                  ? 'border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10'
                  : 'bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-neutral-400 border border-slate-200/80 dark:border-white/10'
              }`}
            >
              <span>{day.dayNum}</span>
              {day.isCompleted && <span className="text-[9px]">✓</span>}
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Clock className="w-8 h-8 text-slate-900 dark:text-white" />
            Daily Routine & Streaks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Build consistency with daily routines. Complete all items to grow your streak!
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Add Routine
        </Button>
      </div>

      {/* Streak Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="p-6 flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 shrink-0">
            <Flame className="w-7 h-7 fill-slate-900 dark:fill-white" />
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

        <Card className="p-6 flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 shrink-0">
            <Trophy className="w-7 h-7 text-slate-900 dark:text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest">
              Longest Streak
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {streakData.longestStreak}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-neutral-400">
                {streakData.longestStreak === 1 ? 'day' : 'days'}
              </span>
            </h3>
          </div>
        </Card>
      </div>

      {/* Routines List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest">
            Daily Routines ({sortedRoutines.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">Complete all items to grow your streak</p>
        </div>

        {sortedRoutines.length === 0 ? (
          <Card className="p-10 text-center border-dashed">
            <Clock className="w-10 h-10 text-slate-400 dark:text-neutral-500 mx-auto mb-3 opacity-60" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Routines Added</h4>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              Add daily items like "Wake Up", "Exercise", "Study", or "Coding".
            </p>
            <Button
              variant="secondary"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={openCreateModal}
              className="mt-4 text-xs"
            >
              Create Routine
            </Button>
          </Card>
        ) : (
          sortedRoutines.map((routine, idx) => {
            const isChecked = routine.completedDates.includes(todayStr);
            return (
              <Card
                key={routine.id}
                className={`p-5 flex items-center justify-between gap-4 transition-all group ${
                  isChecked
                    ? 'bg-slate-200/60 dark:bg-white/10 border-slate-300 dark:border-white/25'
                    : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    onClick={() => toggleRoutineCompletion(routine.id, todayStr)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                      isChecked
                        ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-black'
                        : 'border-slate-400 dark:border-white/30 hover:border-slate-900 dark:hover:border-white'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-bold truncate ${
                        isChecked
                          ? 'line-through text-slate-400 dark:text-neutral-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {routine.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white bg-slate-200/80 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-white/15">
                        {routine.time}
                      </span>
                      {routine.reminder ? (
                        <span className="text-[11px] text-slate-600 dark:text-neutral-300 flex items-center gap-1">
                          <Bell className="w-3 h-3 text-slate-900 dark:text-white" /> Reminder
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-neutral-500 flex items-center gap-1">
                          <BellOff className="w-3 h-3" /> Silent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls & Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    disabled={idx === 0}
                    onClick={() => reorderRoutines(idx, idx - 1)}
                    className="p-2 rounded-full text-slate-400 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    disabled={idx === sortedRoutines.length - 1}
                    onClick={() => reorderRoutines(idx, idx + 1)}
                    className="p-2 rounded-full text-slate-400 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openEditModal(routine)}
                    className="p-2.5 rounded-full text-slate-400 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    title="Edit routine"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteRoutine(routine.id)}
                    className="p-2.5 rounded-full text-slate-400 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    title="Delete routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Calendar History Section */}
      {renderCalendarHistory()}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoutineId ? 'Edit Routine' : 'Create Daily Routine'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
              Routine Title <span className="text-red-500 dark:text-white">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Wake Up, Exercise, Study, Sleep"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
              Scheduled Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Repeat & Reminder Switches */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-slate-900 dark:text-white" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Repeat Every Day</p>
              </div>
              <input
                type="checkbox"
                checked={repeatEveryDay}
                onChange={(e) => setRepeatEveryDay(e.target.checked)}
                className="w-5 h-5 rounded-full border-slate-400 dark:border-white/30 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-900 dark:text-white" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Scheduled Notification</p>
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
    </div>
  );
};
