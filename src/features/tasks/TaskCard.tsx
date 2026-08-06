import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Bell,
  Mic,
  MoreVertical,
  Trash2,
  Edit3,
  Calendar,
  CheckSquare,
  Square,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { TaskItem } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';

interface TaskCardProps {
  task: TaskItem;
  onEdit?: (task: TaskItem) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { toggleTaskComplete, deleteTask } = useTaskStore();
  const [showMenu, setShowMenu] = useState(false);

  // Determine status
  const isCompleted = task.status === 'completed';
  const isOverdue =
    !isCompleted &&
    task.dueDate &&
    new Date(`${task.dueDate}T${task.dueTime || '23:59:59'}`) < new Date();

  let statusLabel = 'Upcoming';
  let cardBgClass = 'bg-[#D9C8F2] text-[#1B2435]'; // Purple
  let iconBgClass = 'bg-[#1B2435]/15 text-[#1B2435]';
  let progressPct = 0;

  if (isCompleted) {
    statusLabel = 'Completed';
    cardBgClass = 'bg-[#C9F48A] text-[#1B2435] shadow-glow-accent'; // Green accent
    iconBgClass = 'bg-[#1B2435]/15 text-[#1B2435]';
    progressPct = 100;
  } else if (isOverdue) {
    statusLabel = 'Overdue';
    cardBgClass = 'bg-[#FF5D73] text-white'; // Red
    iconBgClass = 'bg-black/20 text-white';
    progressPct = 0;
  } else {
    // Pending / Running
    statusLabel = 'Running';
    cardBgClass = 'bg-[#37C7F4] text-[#1B2435] shadow-glow-blue'; // Blue
    iconBgClass = 'bg-[#1B2435]/15 text-[#1B2435]';
    progressPct = 50;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`relative rounded-3xl p-5 shadow-lg transition-all duration-200 ${cardBgClass}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1B2435]/15 backdrop-blur-sm tracking-wide">
            {statusLabel}
          </span>
          {task.reminder && (
            <span className="p-1 rounded-full bg-[#1B2435]/10">
              <Bell className="w-3.5 h-3.5" />
            </span>
          )}
          {(task.voiceNote || task.voiceNoteUrl) && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1B2435]/15">
              <Mic className="w-3 h-3" /> Voice
            </span>
          )}
        </div>

        {/* Right side: Progress percentage & menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-[#1B2435]/15 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                className="h-full bg-[#1B2435]"
              />
            </div>
            <span className="text-xs font-bold font-mono">{progressPct}%</span>
          </div>

          {/* Three Dots Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full hover:bg-[#1B2435]/10 transition-colors"
              aria-label="Task options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 top-8 z-30 w-44 bg-[#1B2435] text-white rounded-2xl p-1.5 shadow-2xl border border-white/10 text-xs font-medium"
                  >
                    <button
                      onClick={() => {
                        toggleTaskComplete(task.id);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
                    >
                      {isCompleted ? (
                        <>
                          <Square className="w-4 h-4 text-amber-400" /> Mark Pending
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-4 h-4 text-emerald-400" /> Mark Done
                        </>
                      )}
                    </button>
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(task);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-blue-400" /> Edit Task
                      </button>
                    )}
                    <button
                      onClick={() => {
                        deleteTask(task.id);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-400 text-left transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Task
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Card Middle Content */}
      <div className="flex items-start gap-4">
        {/* Diamond / Squircle Icon Container */}
        <button
          onClick={() => toggleTaskComplete(task.id)}
          className={`flex items-center justify-center w-12 h-12 rounded-2xl rotate-45 transition-transform hover:scale-105 active:scale-95 flex-shrink-0 ${iconBgClass}`}
          title="Toggle completion"
        >
          <div className="-rotate-45">
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <FileText className="w-6 h-6 stroke-[2]" />
            )}
          </div>
        </button>

        {/* Title and Subtext */}
        <div className="flex-1 min-w-0">
          <h4
            onClick={() => toggleTaskComplete(task.id)}
            className={`text-lg font-bold leading-snug cursor-pointer select-none ${
              isCompleted ? 'line-through opacity-80' : ''
            }`}
          >
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs mt-1 opacity-80 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Time & Date Footer */}
          <div className="flex items-center gap-4 mt-3 text-xs font-semibold opacity-90">
            {task.dueTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{task.dueTime}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{task.dueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
