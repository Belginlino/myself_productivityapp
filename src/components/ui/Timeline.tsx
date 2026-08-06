import React from 'react';
import { TaskItem } from '../../types';
import { TaskCard } from '../../features/tasks/TaskCard';
import { get24HourFromTimeStr, getTaskMinutesFromMidnight } from '../../utils/timeUtils';

interface TimelineProps {
  tasks: TaskItem[];
  onEditTask?: (task: TaskItem) => void;
}

const TIMELINE_HOURS = [
  { label: '06:00 AM', hour: 6 },
  { label: '08:00 AM', hour: 8 },
  { label: '10:00 AM', hour: 10 },
  { label: '12:00 PM', hour: 12 },
  { label: '02:00 PM', hour: 14 },
  { label: '04:00 PM', hour: 16 },
  { label: '06:00 PM', hour: 18 },
  { label: '08:00 PM', hour: 20 },
  { label: '10:00 PM', hour: 22 },
];

export const Timeline: React.FC<TimelineProps> = ({ tasks, onEditTask }) => {
  // Group tasks by nearest timeline hour node seamlessly with zero gaps
  const getTasksForHour = (index: number) => {
    const node = TIMELINE_HOURS[index];
    const isFirst = index === 0;
    const isLast = index === TIMELINE_HOURS.length - 1;
    const nextHour = !isLast ? TIMELINE_HOURS[index + 1].hour : 24;

    const matched = tasks.filter((t) => {
      const h = get24HourFromTimeStr(t.dueTime);
      if (h === null) {
        // If task has no due time specified, display in 8 AM slot
        return node.hour === 8;
      }
      if (isFirst && h < node.hour) {
        // Tasks scheduled earlier than 6 AM go to first slot
        return true;
      }
      if (isLast) {
        return h >= node.hour;
      }
      return h >= node.hour && h < nextHour;
    });

    // Sort tasks chronologically by time within each slot
    return matched.sort((a, b) => {
      const minA = getTaskMinutesFromMidnight(a.dueTime) ?? 0;
      const minB = getTaskMinutesFromMidnight(b.dueTime) ?? 0;
      return minA - minB;
    });
  };

  return (
    <div className="relative py-4">
      {TIMELINE_HOURS.map((node, index) => {
        const isLast = index === TIMELINE_HOURS.length - 1;
        const nodeTasks = getTasksForHour(index);

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
