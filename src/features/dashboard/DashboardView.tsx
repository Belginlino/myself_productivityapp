import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Timer,
  Quote,
  TrendingUp,
  Target,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useAppStore } from '../../store/useAppStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { useGoalStore } from '../../store/useGoalStore';
import { usePomodoroStore } from '../../store/usePomodoroStore';

const dailyQuotes = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" }
];

export const DashboardView: React.FC = () => {
  const { profile, setActiveTab } = useAppStore();
  const { tasks, toggleTaskComplete } = useTaskStore();
  const { routines, toggleRoutineCompletion } = useRoutineStore();
  const { goals } = useGoalStore();
  const { totalSessionsCompleted } = usePomodoroStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote] = useState(() => dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Derived stats
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || t.status === 'pending');
  const completedTasksCount = tasks.filter((t) => t.status === 'completed' && t.completedAt?.startsWith(todayStr)).length;
  const pendingTasksCount = todayTasks.filter((t) => t.status !== 'completed').length;
  const focusMinutes = totalSessionsCompleted * 25;

  const handleTaskToggle = (id: string) => {
    toggleTaskComplete(id);
  };

  const handleRoutineToggle = (id: string) => {
    toggleRoutineCompletion(id, todayStr);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner: Greeting, Live Time & Daily Quote */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 text-white p-6 sm:p-8 shadow-xl shadow-indigo-600/15">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-100 font-medium text-xs sm:text-sm mb-1">
              <span>{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span className="font-mono font-semibold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-3.5 my-1">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt="Profile Avatar"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ring-4 ring-white/30 object-cover shadow-lg shrink-0"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center border border-white/30 shadow-lg shrink-0">
                  {(profile.name || 'U')[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Good day, {profile.name || 'Friend'}! 👋
                </h2>
              </div>
            </div>
            <p className="text-indigo-100/90 text-xs sm:text-sm mt-1 max-w-xl flex items-center gap-1.5 italic">
              <Quote className="w-4 h-4 shrink-0 opacity-80" />
              "{quote.text}" — <span className="font-semibold">{quote.author}</span>
            </p>
          </div>

          {/* Active Streak Badge */}
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-extrabold text-lg shadow-md">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs font-bold">
                <span>{profile.streak} Day Streak</span>
              </div>
              <p className="text-[11px] text-indigo-100 mt-0.5">Productivity Streak Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Tasks</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{pendingTasksCount}</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Focus Time</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{focusMinutes}m</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Routine Items</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{routines.length}</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Goals</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{goals.length}</h4>
          </div>
        </Card>
      </div>

      {/* Main Grid: Today's Tasks + Today's Routines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks Widget */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Today's Tasks</h3>
              <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                {completedTasksCount}/{todayTasks.length} Done
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setActiveTab('tasks')}>
              Manage Tasks
            </Button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {todayTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No tasks due today. Enjoy your day!</p>
            ) : (
              todayTasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/40 opacity-70'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleTaskToggle(task.id)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task.title}
                      </h4>
                      {task.dueDate && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1 font-mono">
                          <CalendarIcon className="w-3 h-3" /> {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        task.priority === 'high'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Daily Routine Schedule Widget */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Daily Routine Schedule</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setActiveTab('routines')}>
              View Timeline
            </Button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {routines.map((routine) => {
              const isChecked = routine.completedDates.includes(todayStr);
              return (
                <div
                  key={routine.id}
                  onClick={() => handleRoutineToggle(routine.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isChecked
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400">
                      {routine.startTime}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {routine.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 capitalize">{routine.timeOfDay} • {routine.description}</p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${isChecked ? 'bg-amber-500' : 'border border-slate-300 dark:border-slate-700'}`}>
                    {isChecked && '✓'}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Second Row: Goals Progress */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Active Goals Progress</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setActiveTab('goals')}>
            Goals & Projects
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="text-slate-800 dark:text-slate-200 truncate">{goal.title}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{goal.progress}%</span>
              </div>
              <ProgressBar progress={goal.progress} height="h-2" color="bg-indigo-600" />
              <p className="text-[10px] text-slate-400 mt-1">Deadline Target: {goal.targetDate}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
