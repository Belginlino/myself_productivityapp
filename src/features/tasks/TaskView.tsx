import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isSameDay } from 'date-fns';
import {
  ChevronLeft,
  MoreVertical,
  ChevronDown,
  Plus,
  Mic,
  Calendar,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useAppStore } from '../../store/useAppStore';
import { DateStrip } from '../../components/ui/DateStrip';
import { Timeline } from '../../components/ui/Timeline';
import { TaskItem } from '../../types';

export const TaskView: React.FC = () => {
  const { tasks } = useTaskStore();
  const { toggleQuickAdd, setActiveTab } = useAppStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Filter tasks for selected date
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayTasks = tasks.filter((t) => {
    if (!t.dueDate) return true; // Tasks without due date show up everywhere
    return t.dueDate === dateStr;
  });

  const filteredTasks = dayTasks.filter((t) => {
    if (filterStatus === 'pending') return t.status === 'pending';
    if (filterStatus === 'completed') return t.status === 'completed';
    return true;
  });

  const completedCount = dayTasks.filter((t) => t.status === 'completed').length;
  const totalCount = dayTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-24"
    >
      {/* Top App Bar (Header) */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setActiveTab('home')}
          className="p-2.5 rounded-full bg-[#23324A] text-white/80 hover:text-white border border-white/5 transition-colors"
          aria-label="Back to home"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-xl font-bold text-white tracking-wide">My Tasks</h1>

        <button
          onClick={() => toggleQuickAdd(true)}
          className="p-2.5 rounded-full bg-[#23324A] text-white/80 hover:text-white border border-white/5 transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Month Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowMonthDropdown(!showMonthDropdown)}
          className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight hover:opacity-80 transition-opacity"
        >
          <span>{format(selectedDate, 'MMMM yyyy')}</span>
          <ChevronDown className="w-6 h-6 text-[#C9F48A]" />
        </button>

        <AnimatePresence>
          {showMonthDropdown && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMonthDropdown(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 top-12 z-30 w-56 bg-[#23324A] rounded-2xl p-3 shadow-2xl border border-white/10 space-y-1"
              >
                <p className="text-[11px] font-bold text-[#A8B3C7] uppercase px-3 py-1">Quick Month Switch</p>
                {[-1, 0, 1, 2].map((offset) => {
                  const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1);
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => {
                        setSelectedDate(d);
                        setShowMonthDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      {format(d, 'MMMM yyyy')}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Horizontal Scrollable Date Strip */}
      <div className="py-1">
        <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} daysRange={21} />
      </div>

      {/* Filter & Summary Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-[#A8B3C7]">
          <span>{filteredTasks.length} tasks scheduled</span>
          {totalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#C9F48A]/20 text-[#C9F48A] text-[10px]">
              {completionPercentage}% Done
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#23324A] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              filterStatus === 'all' ? 'bg-[#C9F48A] text-[#1B2435]' : 'text-white/60 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              filterStatus === 'pending' ? 'bg-[#37C7F4] text-[#1B2435]' : 'text-white/60 hover:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              filterStatus === 'completed' ? 'bg-[#76E56A] text-[#1B2435]' : 'text-white/60 hover:text-white'
            }`}
          >
            Done
          </button>
        </div>
      </div>

      {/* Vertical Timeline View */}
      {filteredTasks.length > 0 ? (
        <Timeline tasks={filteredTasks} onEditTask={setEditingTask} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#23324A]/40 rounded-3xl border border-dashed border-white/10 text-center">
          <div className="w-16 h-16 rounded-full bg-[#23324A] flex items-center justify-center text-[#C9F48A] mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No tasks for this day</h3>
          <p className="text-xs text-[#A8B3C7] max-w-xs mb-4">
            Tap the floating add button below or use voice creation to add a new task!
          </p>
          <button
            onClick={() => toggleQuickAdd(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-bold text-xs shadow-glow-accent hover:bg-[#b1e06d] transition-colors"
          >
            + Create Task
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 sm:right-10 z-40 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => toggleQuickAdd(true)}
          className="w-14 h-14 rounded-full bg-[#C9F48A] text-[#1B2435] flex items-center justify-center shadow-glow-accent font-bold"
          aria-label="Add task"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </motion.button>
      </div>
    </motion.div>
  );
};
