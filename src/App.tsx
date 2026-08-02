import React, { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { TopHeader } from './components/layout/TopHeader';
import { QuickAddModal } from './components/layout/QuickAddModal';
import { SettingsModal } from './components/common/SettingsModal';
import { PinLockScreen } from './components/common/PinLockScreen';

import { HomeView } from './features/home/HomeView';
import { TaskView } from './features/tasks/TaskView';
import { RoutineView } from './features/routines/RoutineView';

import { useAppStore } from './store/useAppStore';
import { useTaskStore } from './store/useTaskStore';
import { useRoutineStore } from './store/useRoutineStore';
import { initAuthListener } from './firebase/authService';
import { pullAllDataFromCloud, initAutoStoreSync } from './firebase/syncService';

export const App: React.FC = () => {
  const { activeTab, settings } = useAppStore();
  const { addTask } = useTaskStore();
  const { addRoutine, recalculateStreaks } = useRoutineStore();

  useEffect(() => {
    // Synchronize initial theme class on root element
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(settings.theme || 'dark');

    // Recalculate routine streaks on app load
    recalculateStreaks();

    let unsubscribeAutoSync: (() => void) | null = null;

    // Initialize Firebase Auth state listener
    const unsubscribeAuth = initAuthListener((user) => {
      if (user) {
        if (settings.autoSyncOnLogin) {
          pullAllDataFromCloud(user.uid);
        }
        if (unsubscribeAutoSync) unsubscribeAutoSync();
        unsubscribeAutoSync = initAutoStoreSync(user.uid);
      } else {
        if (unsubscribeAutoSync) unsubscribeAutoSync();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeAutoSync) unsubscribeAutoSync();
    };
  }, [settings.theme, settings.autoSyncOnLogin]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            onOpenAddTask={() => {
              useAppStore.getState().setActiveTab('tasks');
            }}
            onOpenAddRoutine={() => {
              useAppStore.getState().setActiveTab('routines');
            }}
          />
        );
      case 'tasks':
        return <TaskView />;
      case 'routines':
        return <RoutineView />;
      default:
        return (
          <HomeView
            onOpenAddTask={() => {
              useAppStore.getState().setActiveTab('tasks');
            }}
            onOpenAddRoutine={() => {
              useAppStore.getState().setActiveTab('routines');
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-6xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Bar Navigation */}
      <BottomNav />

      {/* Global Quick Add Modal */}
      <QuickAddModal />

      {/* Global Application Settings Modal */}
      <SettingsModal />

      {/* Passcode PIN Lock Screen */}
      <PinLockScreen />
    </div>
  );
};

export default App;
