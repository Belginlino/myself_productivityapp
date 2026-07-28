import React, { useState } from 'react';
import { Clock, Sun, Sunrise, Sunset, Moon, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useRoutineStore } from '../../store/useRoutineStore';
import { useAppStore } from '../../store/useAppStore';
import { RoutineTimeOfDay } from '../../types';

export const RoutineView: React.FC = () => {
  const { routines, addRoutine, deleteRoutine, toggleRoutineCompletion } = useRoutineStore();
  const { addXP, addCoins } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<RoutineTimeOfDay>('morning');
  const [startTime, setStartTime] = useState('08:00');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggle = (id: string) => {
    toggleRoutineCompletion(id, todayStr);
    addXP(15);
    addCoins(5);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addRoutine({
      title: title.trim(),
      description: description.trim(),
      timeOfDay,
      startTime,
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      reminder: true,
      icon: 'Clock',
      color: '#4F46E5',
    });

    addXP(20);
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const sections: { type: RoutineTimeOfDay; label: string; icon: any; color: string }[] = [
    { type: 'morning', label: 'Morning Routine', icon: Sunrise, color: 'text-amber-500 bg-amber-500/10' },
    { type: 'afternoon', label: 'Afternoon Routine', icon: Sun, color: 'text-emerald-500 bg-emerald-500/10' },
    { type: 'evening', label: 'Evening Routine', icon: Sunset, color: 'text-indigo-500 bg-indigo-500/10' },
    { type: 'night', label: 'Night Routine', icon: Moon, color: 'text-purple-500 bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            Daily Routine Planner
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Time-blocked routines divided across Morning, Afternoon, Evening, and Night.
          </p>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          Add Routine Step
        </Button>
      </div>

      {/* Routine Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const secRoutines = routines.filter((r) => r.timeOfDay === sec.type);
          return (
            <Card key={sec.type}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${sec.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{sec.label}</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {secRoutines.length} items
                </span>
              </div>

              <div className="space-y-3">
                {secRoutines.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No routines added for this block.</p>
                ) : (
                  secRoutines.map((routine) => {
                    const isChecked = routine.completedDates.includes(todayStr);
                    return (
                      <div
                        key={routine.id}
                        onClick={() => handleToggle(routine.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                            {routine.startTime}
                          </span>
                          <div>
                            <h4 className={`text-xs font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                              {routine.title}
                            </h4>
                            {routine.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5">{routine.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-bold text-amber-500">🔥 {routine.streak}d</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRoutine(routine.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Routine Block">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Routine Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Hydrate & Read 15 mins"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input
              type="text"
              placeholder="Context or steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Time Block</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as RoutineTimeOfDay)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Scheduled Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Routine Step
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
