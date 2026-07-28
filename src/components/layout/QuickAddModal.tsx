import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { useGoalStore } from '../../store/useGoalStore';
import { CheckSquare, Clock, Target } from 'lucide-react';
import { GoalCategory } from '../../types';

export const QuickAddModal: React.FC = () => {
  const { isQuickAddOpen, toggleQuickAdd } = useAppStore();
  const { addTask } = useTaskStore();
  const { addRoutine } = useRoutineStore();
  const { addGoal } = useGoalStore();

  const [itemType, setItemType] = useState<'task' | 'routine' | 'goal'>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueTime, setDueTime] = useState('18:00');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (itemType === 'task') {
      addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'pending',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime,
        labels: ['QuickAdd'],
        subtasks: [],
      });
    } else if (itemType === 'routine') {
      addRoutine({
        title: title.trim(),
        description: description.trim(),
        timeOfDay,
        startTime: '08:00',
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        reminder: true,
        icon: 'Clock',
        color: '#4F46E5',
      });
    } else if (itemType === 'goal') {
      addGoal({
        title: title.trim(),
        category: 'personal' as GoalCategory,
        targetDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        milestones: [],
      });
    }

    setTitle('');
    setDescription('');
    toggleQuickAdd(false);
  };

  return (
    <Modal isOpen={isQuickAddOpen} onClose={() => toggleQuickAdd(false)} title="Quick Add Item" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setItemType('task')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              itemType === 'task'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" /> Task
          </button>
          <button
            type="button"
            onClick={() => setItemType('routine')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              itemType === 'routine'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Routine
          </button>
          <button
            type="button"
            onClick={() => setItemType('goal')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              itemType === 'goal'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> Goal
          </button>
        </div>

        {/* Title Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Title
          </label>
          <input
            type="text"
            required
            placeholder={`Enter ${itemType} title...`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Details / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Add extra context or description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Specific Type Settings */}
        {itemType === 'task' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deadline Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {itemType === 'routine' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Time of Day
            </label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as 'morning' | 'afternoon' | 'evening' | 'night')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="morning">Morning Routine</option>
              <option value="afternoon">Afternoon Routine</option>
              <option value="evening">Evening Routine</option>
              <option value="night">Night Routine</option>
            </select>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => toggleQuickAdd(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create Item
          </Button>
        </div>
      </form>
    </Modal>
  );
};
