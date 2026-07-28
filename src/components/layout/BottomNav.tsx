import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Timer,
  Menu,
  Plus,
  Clock,
  Target,
  Settings,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, toggleQuickAdd } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainMobileNav = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'pomodoro', label: 'Focus', icon: Timer },
  ];

  const allModules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'routines', label: 'Daily Routine', icon: Clock },
    { id: 'goals', label: 'Goals & Projects', icon: Target },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'pomodoro', label: 'Pomodoro Focus', icon: Timer },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectModule = (id: string) => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Slide-Up Full Menu Sheet */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative w-full bg-white dark:bg-slate-900 amoled:bg-amoled-card border-t border-slate-200 dark:border-slate-800 amoled:border-amoled-border rounded-t-3xl p-6 shadow-2xl z-10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Navigation Modules</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
              {allModules.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectModule(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-1.5" />
                    <span className="text-[11px] truncate w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 amoled:bg-amoled-card/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 amoled:border-amoled-border px-3 py-2 flex items-center justify-around">
        {mainMobileNav.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Center Floating Quick Add Button */}
        <button
          onClick={() => toggleQuickAdd(true)}
          className="-mt-6 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>

        {mainMobileNav.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>
    </>
  );
};
