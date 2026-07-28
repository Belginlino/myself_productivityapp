import React, { useState, useEffect } from 'react';
import { Search, CheckSquare, Target, ArrowRight, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useGoalStore } from '../../store/useGoalStore';
import { useRoutineStore } from '../../store/useRoutineStore';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, toggleSearch, setActiveTab } = useAppStore();
  const { tasks } = useTaskStore();
  const { goals } = useGoalStore();
  const { routines } = useRoutineStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch]);

  if (!isSearchOpen) return null;

  const lowerQuery = query.toLowerCase().trim();

  const filteredTasks = lowerQuery
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerQuery) ||
          t.description?.toLowerCase().includes(lowerQuery)
      )
    : tasks.slice(0, 4);

  const filteredRoutines = lowerQuery
    ? routines.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerQuery) ||
          r.description?.toLowerCase().includes(lowerQuery)
      )
    : routines.slice(0, 3);

  const filteredGoals = lowerQuery
    ? goals.filter(
        (g) =>
          g.title.toLowerCase().includes(lowerQuery) ||
          g.description?.toLowerCase().includes(lowerQuery)
      )
    : goals.slice(0, 3);

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    toggleSearch(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => toggleSearch(false)}
      />

      {/* Search Dialog Box */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 amoled:bg-amoled-card border border-slate-200 dark:border-slate-800 amoled:border-amoled-border rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search tasks, routines, and goals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-4 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => toggleSearch(false)}
            className="text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Tasks Section */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-500" /> Tasks ({filteredTasks.length})
                </span>
                <button
                  onClick={() => navigateToTab('tasks')}
                  className="hover:text-indigo-500 transition-colors flex items-center gap-1 text-[11px]"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigateToTab('tasks')}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {t.title}
                      </h5>
                      {t.dueDate && (
                        <span className="text-[10px] text-slate-400 font-mono">Due: {t.dueDate} {t.dueTime ? `at ${t.dueTime}` : ''}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Routines Section */}
          {filteredRoutines.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Routines ({filteredRoutines.length})
                </span>
                <button
                  onClick={() => navigateToTab('routines')}
                  className="hover:text-amber-500 transition-colors flex items-center gap-1 text-[11px]"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1">
                {filteredRoutines.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => navigateToTab('routines')}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {r.title}
                    </h5>
                    <span className="text-[10px] font-bold text-amber-500 font-mono">
                      {r.startTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals Section */}
          {filteredGoals.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-500" /> Goals ({filteredGoals.length})
                </span>
                <button
                  onClick={() => navigateToTab('goals')}
                  className="hover:text-blue-500 transition-colors flex items-center gap-1 text-[11px]"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1">
                {filteredGoals.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => navigateToTab('goals')}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {g.title}
                    </h5>
                    <span className="text-[10px] font-bold text-indigo-500">{g.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
