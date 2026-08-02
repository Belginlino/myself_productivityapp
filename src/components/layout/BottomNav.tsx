import React from 'react';
import { Home, CheckSquare, Clock, Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, toggleQuickAdd } = useAppStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[rgba(5,5,5,0.85)] backdrop-blur-2xl border-t border-black/10 dark:border-white/10 px-6 py-2.5 flex items-center justify-between">
      {/* Home Tab */}
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold py-1 px-3.5 rounded-full transition-all ${
          activeTab === 'home'
            ? 'text-slate-900 dark:text-white bg-black/5 dark:bg-white/10'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      {/* Center Floating Quick Add Button */}
      <button
        onClick={() => toggleQuickAdd(true)}
        className="-mt-7 w-13 h-13 rounded-full bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.35)] flex items-center justify-center active:scale-95 transition-transform"
        title="Quick Add"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Tasks Tab */}
      <button
        onClick={() => setActiveTab('tasks')}
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold py-1 px-3.5 rounded-full transition-all ${
          activeTab === 'tasks'
            ? 'text-slate-900 dark:text-white bg-black/5 dark:bg-white/10'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <CheckSquare className="w-5 h-5" />
        <span>Tasks</span>
      </button>

      {/* Routine Tab */}
      <button
        onClick={() => setActiveTab('routines')}
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold py-1 px-3.5 rounded-full transition-all ${
          activeTab === 'routines'
            ? 'text-slate-900 dark:text-white bg-black/5 dark:bg-white/10'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <Clock className="w-5 h-5" />
        <span>Routine</span>
      </button>
    </div>
  );
};
