import React from 'react';
import { motion } from 'framer-motion';
import { Home, CheckSquare, Clock, Timer, Plus, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, toggleQuickAdd, toggleSettings } = useAppStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1B2435]/90 backdrop-blur-2xl border-t border-white/10 px-1 sm:px-4 py-2 flex items-center justify-around shadow-2xl">
      {/* Home Tab */}
      <button
        onClick={() => setActiveTab('home')}
        className={`relative flex flex-col items-center gap-1 text-[10px] font-bold py-1.5 px-1.5 sm:px-3 rounded-2xl transition-all ${
          activeTab === 'home' ? 'text-[#C9F48A]' : 'text-[#A8B3C7] hover:text-white'
        }`}
      >
        {activeTab === 'home' && (
          <motion.div
            layoutId="activeBottomTab"
            className="absolute inset-0 bg-white/10 rounded-2xl"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Home className="relative z-10 w-5 h-5" />
        <span className="relative z-10">Home</span>
      </button>

      {/* Tasks Tab */}
      <button
        onClick={() => setActiveTab('tasks')}
        className={`relative flex flex-col items-center gap-1 text-[10px] font-bold py-1.5 px-1.5 sm:px-3 rounded-2xl transition-all ${
          activeTab === 'tasks' ? 'text-[#C9F48A]' : 'text-[#A8B3C7] hover:text-white'
        }`}
      >
        {activeTab === 'tasks' && (
          <motion.div
            layoutId="activeBottomTab"
            className="absolute inset-0 bg-white/10 rounded-2xl"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <CheckSquare className="relative z-10 w-5 h-5" />
        <span className="relative z-10">Tasks</span>
      </button>

      {/* Center Quick Add Floating Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => toggleQuickAdd(true)}
        className="-mt-7 w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#C9F48A] text-[#1B2435] shadow-glow-accent flex items-center justify-center font-extrabold shrink-0 border-4 border-[#1B2435]"
        title="Quick Add Task / Routine"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </motion.button>

      {/* Routine Tab */}
      <button
        onClick={() => setActiveTab('routines')}
        className={`relative flex flex-col items-center gap-1 text-[10px] font-bold py-1.5 px-1.5 sm:px-3 rounded-2xl transition-all ${
          activeTab === 'routines' ? 'text-[#C9F48A]' : 'text-[#A8B3C7] hover:text-white'
        }`}
      >
        {activeTab === 'routines' && (
          <motion.div
            layoutId="activeBottomTab"
            className="absolute inset-0 bg-white/10 rounded-2xl"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Clock className="relative z-10 w-5 h-5" />
        <span className="relative z-10">Routine</span>
      </button>

      {/* Pomodoro Tab */}
      <button
        onClick={() => setActiveTab('pomodoro')}
        className={`relative flex flex-col items-center gap-1 text-[10px] font-bold py-1.5 px-1.5 sm:px-3 rounded-2xl transition-all ${
          activeTab === 'pomodoro' ? 'text-[#C9F48A]' : 'text-[#A8B3C7] hover:text-white'
        }`}
      >
        {activeTab === 'pomodoro' && (
          <motion.div
            layoutId="activeBottomTab"
            className="absolute inset-0 bg-white/10 rounded-2xl"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Timer className="relative z-10 w-5 h-5" />
        <span className="relative z-10">Focus</span>
      </button>

      {/* Settings Tab */}
      <button
        onClick={() => toggleSettings(true)}
        className="relative flex flex-col items-center gap-1 text-[10px] font-bold py-1.5 px-1.5 sm:px-3 rounded-2xl transition-all text-[#A8B3C7] hover:text-white"
        title="Settings"
      >
        <Settings className="relative z-10 w-5 h-5" />
        <span className="relative z-10">Settings</span>
      </button>
    </div>
  );
};

