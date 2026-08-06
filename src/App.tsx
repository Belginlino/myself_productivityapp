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
import { useRoutineStore } from './store/useRoutineStore';
import { initAuthListener } from './firebase/authService';
import { pullAllDataFromCloud, initAutoStoreSync } from './firebase/syncService';

export const App: React.FC = () => {
  const { activeTab, settings } = useAppStore();
  const { recalculateStreaks } = useRoutineStore();

  useEffect(() => {
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
  }, [settings.autoSyncOnLogin]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            onOpenAddTask={() => useAppStore.getState().setActiveTab('tasks')}
            onOpenAddRoutine={() => useAppStore.getState().setActiveTab('routines')}
          />
        );
      case 'tasks':
        return <TaskView />;
      case 'routines':
        return <RoutineView />;
      default:
        return (
          <HomeView
            onOpenAddTask={() => useAppStore.getState().setActiveTab('tasks')}
            onOpenAddRoutine={() => useAppStore.getState().setActiveTab('routines')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#1B2435] text-white selection:bg-[#C9F48A] selection:text-[#1B2435]">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        <TopHeader />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-4 max-w-4xl w-full mx-auto">
          {renderActiveView()}
        </main>

        {/* Floating Mobile Glass Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Global Quick Add Bottom Sheet Modal */}
      <QuickAddModal />

      {/* Global Settings Modal */}
      <SettingsModal />

      {/* PIN Lock Screen */}
      <PinLockScreen />
    </div>
  );
};

export default App;
