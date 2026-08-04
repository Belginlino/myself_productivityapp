import React from 'react';
import { motion } from 'framer-motion';
import { Home, CheckSquare, Clock, Plus, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, toggleQuickAdd, toggleSettings } = useAppStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/10 px-3 py-2 flex items-center justify-around shadow-2xl">
      {/* Home Tab */}
      <button
        onClick={() => setActiveTab('home')}
        className={`relative flex flex-col items-center gap-1 text-[10px] font-black py-1 px-3 rounded-2xl transition-all ${
          activeTab === 'home'
            ? 'text-slate-900 dark:text-white'
            : 'text-slate-400 dark:text-neutral-500'
        }`}
      >
        {activeTab === 'home' && (
          <motion.div
            layoutId="activeBottomTab"
            className="absolute inset-0 bg-slate-100 dark:bg-white/10 rounded-2xl"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Home className="relative z-10 w-4.5 h-4.5" />
        <span className="relative z-10">Home</span>
      </button>

      {/* Tasks Tab */}
      <button
        onClick={() => setActiveTab('tasks')}
        className={`relative flex flex-col items-center gap-1 text-[10px] font-black py-1 px-3 rounded-2xl transition-all ${
          activeTab === 'tasks'
            ? 'text-slate-900 dark:text-white'
            : 'text-slate-400 dark:text-neutral-500'
        }`}
      >
        {activeTab === 'tasks' && (
          <motion.div
            layoutId="activeBottomTab"
            className="absolute inset-0 bg-slate-100 dark:bg-white/10 rounded-2xl"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <CheckSquare className="relative z-10 w-4.5 h-4.5" />
        <span className="relative z-10">Tasks</span>
      </button>

      {/* Floating Center Quick Add Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => toggleQuickAdd(true)}
        className="-mt-6 w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-glow-slate flex items-center justify-center transition-transform shrink-0"
        title="Quick Add"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </motion.button>

      {/* Routine Tab */}
      <button
        onClick={() => setActiveTab('routines')}
        className={`relative flex flex-col items-center gap-1 text-[10px] font-black py-1 px-3 rounded-2xl transition-all ${
          activeTab === 'routines'
            ? 'text-slate-900 dark:text-white'
            : 'text-slate-400 dark:text-neutral-500'
        }`}
      >
        {activeTab === 'routines' && (
          <motion.div
            layoutId="activeBottomTab"
            className="absolute inset-0 bg-slate-100 dark:bg-white/10 rounded-2xl"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Clock className="relative z-10 w-4.5 h-4.5" />
        <span className="relative z-10">Routine</span>
      </button>

      {/* Settings Tab */}
      <button
        onClick={() => toggleSettings(true)}
        className="relative flex flex-col items-center gap-1 text-[10px] font-black py-1 px-3 rounded-2xl transition-all text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white"
        title="Settings"
      >
        <Settings className="relative z-10 w-4.5 h-4.5" />
        <span className="relative z-10">Settings</span>
      </button>
    </div>
  );
};
