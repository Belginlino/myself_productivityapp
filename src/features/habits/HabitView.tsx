import React, { useState } from 'react';
import { Flame, Plus, Trophy, Calendar as CalendarIcon, Trash2, Check, Sparkles } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useHabitStore } from '../../store/useHabitStore';
import { useAppStore } from '../../store/useAppStore';

export const HabitView: React.FC = () => {
  const { habits, addHabit, deleteHabit, toggleHabitCompletion } = useHabitStore();
  const { addXP, addCoins } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10B981');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const todayStr = new Date().toISOString().split('T')[0];

  // Generate past 14 days array for matrix view
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

  const handleToggle = (id: string, dateStr: string) => {
    const checked = toggleHabitCompletion(id, dateStr);
    if (checked) {
      addXP(25);
      addCoins(15);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHabit({
      title: title.trim(),
      description: description.trim(),
      icon: 'Flame',
      color,
      frequency,
      targetCount: 1,
    });

    addXP(20);
    addCoins(10);
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Habit Tracker & Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build long-term consistency with daily heatmaps & streak multipliers.
          </p>
        </div>

        <Button variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          New Habit
        </Button>
      </div>

      {/* Heatmap / Matrix View Table */}
      <Card className="overflow-x-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-500" /> 14-Day Completion Matrix
          </h3>
          <span className="text-xs text-slate-400 font-mono">Today: {todayStr}</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[180px]">Habit</th>
              {last14Days.map((dateStr) => {
                const dayNum = dateStr.slice(-2);
                const isToday = dateStr === todayStr;
                return (
                  <th key={dateStr} className={`pb-3 text-center text-[10px] font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400'}`}>
                    {dayNum}
                  </th>
                );
              })}
              <th className="pb-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {habits.map((habit) => (
              <tr key={habit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 font-semibold text-xs text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.color || '#10B981' }} />
                    <span className="truncate">{habit.title}</span>
                  </div>
                </td>

                {last14Days.map((dateStr) => {
                  const isDone = habit.completedDates.includes(dateStr);
                  return (
                    <td key={dateStr} className="py-3 text-center">
                      <button
                        onClick={() => handleToggle(habit.id, dateStr)}
                        className={`w-6 h-6 rounded-lg mx-auto flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-sm scale-105'
                            : 'bg-slate-100 dark:bg-slate-800 text-transparent hover:border hover:border-emerald-500'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                  );
                })}

                <td className="py-3 text-center">
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    🔥 {habit.streak}d
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Habit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit) => {
          const isDoneToday = habit.completedDates.includes(todayStr);
          return (
            <Card key={habit.id} className="relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
                    style={{ backgroundColor: habit.color || '#10B981' }}
                  >
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{habit.title}</h4>
                    <p className="text-xs text-slate-400 capitalize">{habit.frequency} • {habit.description || 'Daily Target'}</p>
                  </div>
                </div>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Longest Streak</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">🏆 {habit.longestStreak} Days</span>
                </div>

                <Button
                  size="sm"
                  variant={isDoneToday ? 'secondary' : 'outline'}
                  onClick={() => handleToggle(habit.id, todayStr)}
                >
                  {isDoneToday ? 'Completed Today ✓' : 'Mark Completed'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Habit">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Habit Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Morning Meditate 15 mins"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input
              type="text"
              placeholder="Why this habit matters..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Color Theme</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary">
              Save Habit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
