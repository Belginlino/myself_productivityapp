import React, { useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { useAppStore } from '../../store/useAppStore';

export const PomodoroView: React.FC = () => {
  const {
    sessionType,
    workDurationMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    secondsRemaining,
    isRunning,
    totalSessionsCompleted,
    sessionHistory,
    setSessionType,
    setDurations,
    startTimer,
    pauseTimer,
    resetTimer,
    tickTimer,
  } = usePomodoroStore();

  const { addXP, addCoins } = useAppStore();

  // Tick interval effect when running
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, tickTimer]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  let totalTargetSeconds = workDurationMinutes * 60;
  if (sessionType === 'shortBreak') totalTargetSeconds = shortBreakMinutes * 60;
  if (sessionType === 'longBreak') totalTargetSeconds = longBreakMinutes * 60;

  const progressPercent = Math.min(100, Math.max(0, ((totalTargetSeconds - secondsRemaining) / totalTargetSeconds) * 100));

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Timer className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Pomodoro Focus Timer
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Eliminate distractions, maintain deep focus, and log focus statistics.
        </p>
      </div>

      {/* Main Timer Display Box */}
      <Card className="p-8 sm:p-12 text-center relative overflow-hidden flex flex-col items-center">
        {/* Session Type Selectors */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSessionType('work')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              sessionType === 'work'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🔥 Deep Work (25m)
          </button>
          <button
            onClick={() => setSessionType('shortBreak')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              sessionType === 'shortBreak'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ☕ Short Break (5m)
          </button>
          <button
            onClick={() => setSessionType('longBreak')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              sessionType === 'longBreak'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🌴 Long Break (15m)
          </button>
        </div>

        {/* Circular Animated SVG Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-200 dark:text-slate-800 fill-none"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              className={`transition-all duration-1000 fill-none ${
                sessionType === 'work'
                  ? 'text-indigo-600'
                  : sessionType === 'shortBreak'
                  ? 'text-emerald-600'
                  : 'text-purple-600'
              }`}
            />
          </svg>

          {/* Time Counter Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-2">
              {isRunning ? 'Session Active' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <Button
            size="lg"
            variant={sessionType === 'work' ? 'primary' : 'secondary'}
            onClick={isRunning ? pauseTimer : startTimer}
            className="px-8 shadow-xl"
            icon={isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          >
            {isRunning ? 'Pause Focus' : 'Start Session'}
          </Button>
        </div>

        {/* Presets Button Row */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 font-semibold">
          <span>Preset Durations:</span>
          <button
            onClick={() => setDurations(25, 5, 15)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            25/5 Classic
          </button>
          <button
            onClick={() => setDurations(50, 10, 20)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            50/10 Extended
          </button>
          <button
            onClick={() => setDurations(90, 20, 30)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            90/20 Ultradian
          </button>
        </div>
      </Card>

      {/* Focus Stats & History Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="flex items-center gap-4 py-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalSessionsCompleted}</h4>
            <p className="text-xs text-slate-400 font-medium">Completed Focus Sessions Today</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalSessionsCompleted * 25} Mins</h4>
            <p className="text-xs text-slate-400 font-medium">Total Deep Work Logged</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
