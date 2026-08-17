import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings as SettingsIcon,
  CheckCircle2,
  Volume2,
  VolumeX,
  Target,
  Flame,
  Clock,
  Sparkles,
  X,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { useTaskStore } from '../../store/useTaskStore';
import { PomodoroMode } from '../../types';

export const PomodoroView: React.FC = () => {
  const {
    mode,
    timeLeft,
    isRunning,
    completedTodayCount,
    selectedTaskId,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    skipSession,
    setMode,
    setSelectedTaskId,
    updateSettings,
    completeSession,
  } = usePomodoroStore();

  const { tasks, toggleTaskComplete } = useTaskStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);

  // Active interval for timer tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for SVG ring
  const getModeDurationSeconds = (m: PomodoroMode) => {
    switch (m) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  };

  const totalModeSeconds = getModeDurationSeconds(mode);
  const progressPct = Math.max(0, Math.min(100, ((totalModeSeconds - timeLeft) / totalModeSeconds) * 100));

  // Color theme per mode
  const modeColors = {
    work: {
      accent: '#FF5D73',
      accentBg: 'bg-[#FF5D73]/10',
      accentBorder: 'border-[#FF5D73]/30',
      accentText: 'text-[#FF5D73]',
      glow: 'shadow-[0_0_50px_rgba(255,93,115,0.25)]',
      gradient: 'from-[#FF5D73] to-[#FF8E53]',
      label: 'Focus Session',
    },
    shortBreak: {
      accent: '#37C7F4',
      accentBg: 'bg-[#37C7F4]/10',
      accentBorder: 'border-[#37C7F4]/30',
      accentText: 'text-[#37C7F4]',
      glow: 'shadow-[0_0_50px_rgba(55,199,244,0.25)]',
      gradient: 'from-[#37C7F4] to-[#2563EB]',
      label: 'Short Break',
    },
    longBreak: {
      accent: '#A855F7',
      accentBg: 'bg-[#A855F7]/10',
      accentBorder: 'border-[#A855F7]/30',
      accentText: 'text-[#A855F7]',
      glow: 'shadow-[0_0_50px_rgba(168,85,247,0.25)]',
      gradient: 'from-[#A855F7] to-[#EC4899]',
      label: 'Long Break',
    },
  };

  const currentTheme = modeColors[mode];
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // SVG Circle calculation
  const ringRadius = 110;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-28"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-xs font-bold text-[#A8B3C7] tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#C9F48A]" /> Productivity Mode
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 tracking-tight">
            Pomodoro Focus
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
              settings.soundEnabled
                ? 'bg-white/10 border-white/20 text-[#C9F48A]'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
            title={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Settings Modal Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/15 transition-all"
            title="Timer Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#23324A] border border-white/10 max-w-md mx-auto">
        {(['work', 'shortBreak', 'longBreak'] as PomodoroMode[]).map((m) => {
          const isActive = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`relative flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-200 ${
                isActive ? 'text-white' : 'text-[#A8B3C7] hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activePomoMode"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${modeColors[m].gradient} shadow-md`}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 capitalize">
                {m === 'work' ? 'Focus (25m)' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Timer Display Section */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className={`relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center rounded-full ${currentTheme.glow} transition-all duration-500`}>
          {/* SVG Progress Ring */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
            {/* Background Track */}
            <circle
              cx="130"
              cy="130"
              r={ringRadius}
              className="stroke-white/10"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Dynamic Animated Progress Track */}
            <motion.circle
              cx="130"
              cy="130"
              r={ringRadius}
              stroke={currentTheme.accent}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </svg>

          {/* Inner Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest ${currentTheme.accentBg} ${currentTheme.accentText} ${currentTheme.accentBorder} border mb-2`}
            >
              {currentTheme.label}
            </span>

            <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tighter">
              {formatTime(timeLeft)}
            </span>

            {/* Linked Task Indicator */}
            {selectedTask ? (
              <div className="mt-3 max-w-[200px] text-center">
                <span className="text-[11px] text-[#A8B3C7] block font-semibold">Focusing on:</span>
                <span className="text-xs text-white font-bold truncate block">{selectedTask.title}</span>
              </div>
            ) : (
              <span className="mt-3 text-xs text-[#A8B3C7] font-medium">
                {isRunning ? 'Stay Focused! 🔥' : 'Ready to begin?'}
              </span>
            )}
          </div>
        </div>

        {/* Playback Action Buttons */}
        <div className="flex items-center gap-4 mt-8">
          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="w-12 h-12 rounded-2xl bg-[#23324A] border border-white/10 text-[#A8B3C7] hover:text-white flex items-center justify-center transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          {/* Primary Play / Pause Button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={isRunning ? pauseTimer : startTimer}
            className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${currentTheme.gradient} text-white flex items-center justify-center shadow-lg hover:brightness-110 transition-all`}
          >
            {isRunning ? (
              <Pause className="w-9 h-9 fill-white" />
            ) : (
              <Play className="w-9 h-9 fill-white ml-1" />
            )}
          </motion.button>

          {/* Skip Phase Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={skipSession}
            className="w-12 h-12 rounded-2xl bg-[#23324A] border border-white/10 text-[#A8B3C7] hover:text-white flex items-center justify-center transition-colors"
            title="Skip to Next Phase"
          >
            <SkipForward className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Task Linker Card */}
      <div className="p-5 rounded-3xl bg-[#23324A] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-[#C9F48A]" /> Attach Target Task
          </h3>
          {selectedTask && (
            <button
              onClick={() => {
                toggleTaskComplete(selectedTask.id);
                completeSession();
              }}
              className="text-xs font-bold text-[#C9F48A] hover:underline flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" /> Complete Task Now
            </button>
          )}
        </div>

        {/* Selected Task Box or Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setIsTaskDropdownOpen(!isTaskDropdownOpen)}
            className="w-full p-3.5 rounded-2xl bg-[#1B2435] border border-white/10 flex items-center justify-between text-left text-xs font-medium hover:border-white/20 transition-all"
          >
            {selectedTask ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9F48A] shrink-0" />
                <span className="font-bold text-white truncate">{selectedTask.title}</span>
              </div>
            ) : (
              <span className="text-[#A8B3C7]">Select a task to focus on...</span>
            )}
            <ChevronDown className="w-4 h-4 text-[#A8B3C7] shrink-0 ml-2" />
          </button>

          {/* Dropdown Options */}
          <AnimatePresence>
            {isTaskDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 right-0 mt-2 z-30 p-2 rounded-2xl bg-[#1B2435] border border-white/15 shadow-2xl space-y-1 max-h-56 overflow-y-auto"
              >
                <button
                  onClick={() => {
                    setSelectedTaskId(null);
                    setIsTaskDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-[#A8B3C7] hover:bg-white/5 hover:text-white transition-colors"
                >
                  None (Standalone Pomodoro)
                </button>
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        setIsTaskDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                        selectedTaskId === t.id
                          ? 'bg-[#C9F48A]/20 text-[#C9F48A]'
                          : 'text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{t.title}</span>
                      {t.dueTime && (
                        <span className="text-[10px] text-[#A8B3C7] font-normal shrink-0 ml-2">
                          {t.dueTime}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-[#A8B3C7]">No pending tasks found.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Daily Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-[#23324A] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5D73]/20 text-[#FF5D73] flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-[#FF5D73]" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white font-mono">
              {completedTodayCount}
            </span>
            <span className="text-xs text-[#A8B3C7] block font-semibold">Sessions Completed Today</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#23324A] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C9F48A]/20 text-[#C9F48A] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white font-mono">
              {completedTodayCount * settings.workDuration}m
            </span>
            <span className="text-xs text-[#A8B3C7] block font-semibold">Total Focus Time Today</span>
          </div>
        </div>
      </div>

      {/* Settings Glass Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#1B2435] border border-white/15 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-[#C9F48A]" /> Timer Settings
                </h3>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#A8B3C7] hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Durations */}
              <div className="space-y-4 text-xs font-bold text-[#A8B3C7]">
                <div>
                  <label className="block text-white mb-1.5">Focus Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={settings.workDuration}
                    onChange={(e) =>
                      updateSettings({ workDuration: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-[#23324A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#C9F48A]"
                  />
                </div>

                <div>
                  <label className="block text-white mb-1.5">Short Break Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreakDuration}
                    onChange={(e) =>
                      updateSettings({ shortBreakDuration: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-[#23324A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#C9F48A]"
                  />
                </div>

                <div>
                  <label className="block text-white mb-1.5">Long Break Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreakDuration}
                    onChange={(e) =>
                      updateSettings({ longBreakDuration: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-[#23324A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#C9F48A]"
                  />
                </div>

                <div>
                  <label className="block text-white mb-1.5">Long Break Interval (sessions)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.longBreakInterval}
                    onChange={(e) =>
                      updateSettings({ longBreakInterval: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-[#23324A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#C9F48A]"
                  />
                </div>

                {/* Automation Toggles */}
                <div className="pt-2 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-white">Auto-start Breaks</span>
                    <input
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                      className="w-5 h-5 accent-[#C9F48A] rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-white">Auto-start Pomodoros</span>
                    <input
                      type="checkbox"
                      checked={settings.autoStartPomodoros}
                      onChange={(e) => updateSettings({ autoStartPomodoros: e.target.checked })}
                      className="w-5 h-5 accent-[#C9F48A] rounded"
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-3 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-extrabold text-xs shadow-glow-accent hover:bg-[#b1e06d] transition-all"
              >
                Save & Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
