import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Target,
  Calendar,
  Timer,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'routines', label: 'Daily Routine', icon: Clock },
  { id: 'goals', label: 'Goals & Projects', icon: Target },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'pomodoro', label: 'Pomodoro Focus', icon: Timer },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 amoled:bg-amoled-card border-r border-slate-200/80 dark:border-slate-800/80 amoled:border-amoled-border h-screen sticky top-0 z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
            Myself
          </h1>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Productivity OS v1.0
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Upgrade / Pro Banner */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-emerald-500/10 to-transparent border border-indigo-500/20 text-xs">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
          <Sparkles className="w-4 h-4" /> Cloud Sync Active
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
          Local offline mode & automatic cloud sync connected.
        </p>
      </div>
    </aside>
  );
};
