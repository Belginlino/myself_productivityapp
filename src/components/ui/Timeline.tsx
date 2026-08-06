import React from 'react';
import { TaskItem } from '../../types';
import { TaskCard } from '../../features/tasks/TaskCard';
import { Clock } from 'lucide-react';

interface TimelineProps {
  tasks: TaskItem[];
  onEditTask?: (task: TaskItem) => void;
}

const TIMELINE_HOURS = [
  { label: '08:00 AM', hour: 8 },
  { label: '10:00 AM', hour: 10 },
  { label: '12:00 PM', hour: 12 },
  { label: '03:00 PM', hour: 15 },
  { label: '06:00 PM', hour: 18 },
  { label: '08:00 PM', hour: 20 },
  { label: '10:00 PM', hour: 22 },
];

export const Timeline: React.FC<TimelineProps> = ({ tasks, onEditTask }) => {
  // Helper to extract hour number from dueTime string "HH:mm"
  const getTaskHour = (dueTime?: string): number | null => {
    if (!dueTime) return null;
    const parts = dueTime.split(':');
    if (parts.length > 0) {
      const h = parseInt(parts[0], 10);
      return isNaN(h) ? null : h;
    }
    return null;
  };

  // Group tasks by nearest timeline hour node
  const getTasksForHour = (targetHour: number, isLast: boolean) => {
    return tasks.filter((t) => {
      const h = getTaskHour(t.dueTime);
      if (h === null) {
        // If no due time, group in 8 AM slot
        return targetHour === 8;
      }
      if (isLast) {
        return h >= targetHour;
      }
      return h >= targetHour && h < targetHour + 2;
    });
  };

  return (
    <div className="relative py-4">
      {TIMELINE_HOURS.map((node, index) => {
        const isLast = index === TIMELINE_HOURS.length - 1;
        const nodeTasks = getTasksForHour(node.hour, isLast);

        return (
          <div key={node.label} className="relative flex gap-2.5 sm:gap-6 mb-6 sm:mb-8 group">
            {/* Left Column: Time label & Dashed vertical line */}
            <div className="flex flex-col items-center min-w-[58px] sm:min-w-[80px] shrink-0 pt-1">
              <span className="text-[10px] sm:text-xs font-bold text-text-secondary tracking-wider font-mono text-center">
                {node.label}
              </span>

              {/* Node Indicator Dot */}
              <div className="w-3 h-3 rounded-full bg-[#37C7F4] ring-4 ring-[#1B2435] my-2 shadow-glow-blue" />

              {/* Dashed Vertical Line connecting nodes */}
              {!isLast && (
                <div className="flex-1 w-0 border-l-2 border-dashed border-white/15 my-1" />
              )}
            </div>

            {/* Right Column: Aligned Task Cards */}
            <div className="flex-1 min-w-0 space-y-4 pt-0">
              {nodeTasks.length > 0 ? (
                nodeTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={onEditTask} />
                ))
              ) : (
                <div className="h-12 border border-dashed border-white/5 rounded-2xl flex items-center px-4 text-xs text-white/30 italic">
                  No tasks scheduled
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
