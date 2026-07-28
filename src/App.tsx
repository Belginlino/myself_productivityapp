import React, { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { TopHeader } from './components/layout/TopHeader';
import { QuickAddModal } from './components/layout/QuickAddModal';

import { DashboardView } from './features/dashboard/DashboardView';
import { TaskView } from './features/tasks/TaskView';
import { RoutineView } from './features/routines/RoutineView';
import { GoalProjectView } from './features/goals/GoalProjectView';
import { CalendarView } from './features/calendar/CalendarView';
import { PomodoroView } from './features/pomodoro/PomodoroView';
import { SettingsView } from './features/settings/SettingsView';

import { useAppStore } from './store/useAppStore';

export const App: React.FC = () => {
  const { activeTab, settings } = useAppStore();

  useEffect(() => {
    // Synchronize initial theme class on root element
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'amoled');
    if (settings.theme === 'amoled') {
      root.classList.add('dark', 'amoled');
    } else {
      root.classList.add(settings.theme || 'dark');
    }
  }, [settings.theme]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return <TaskView />;
      case 'routines':
        return <RoutineView />;
      case 'goals':
        return <GoalProjectView />;
      case 'calendar':
        return <CalendarView />;
      case 'pomodoro':
        return <PomodoroView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 amoled:bg-black text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Bar Navigation */}
      <BottomNav />

      {/* Global Modals */}
      <QuickAddModal />
    </div>
  );
};

export default App;
