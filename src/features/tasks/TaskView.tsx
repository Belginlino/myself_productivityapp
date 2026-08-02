import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Mic,
  MicOff,
  Bell,
  BellOff,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useTaskStore } from '../../store/useTaskStore';
import { TaskItem } from '../../types';
import { speechService } from '../../services/speechService';
import { requestNotificationPermissions } from '../../services/notificationService';

export const TaskView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete } = useTaskStore();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState(true);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Collapsible Completed Tasks Section
  const [showCompleted, setShowCompleted] = useState(true);

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const openCreateModal = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setDueTime('');
    setReminder(true);
    setVoiceError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate || '');
    setDueTime(task.dueTime || '');
    setReminder(task.reminder);
    setVoiceError(null);
    setIsModalOpen(true);
  };

  const handleStartVoice = () => {
    setVoiceError(null);
    if (!speechService.isSupported()) {
      setVoiceError('Speech recognition is not supported in your browser.');
      return;
    }

    setIsListening(true);
    speechService.startListening({
      onResult: (text) => {
        setTitle(text);
      },
      onError: (err) => {
        setIsListening(false);
        setVoiceError(err || 'Failed to hear audio.');
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleStopVoice = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (reminder && dueDate) {
      await requestNotificationPermissions();
    }

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        reminder,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        reminder,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <CheckSquare className="w-8 h-8 text-slate-900 dark:text-white" />
            Task Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Organize daily tasks, set deadline notifications, and create tasks with voice.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Add Task
        </Button>
      </div>

      {/* Active Tasks List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest">
          Active Tasks ({activeTasks.length})
        </h3>

        {activeTasks.length === 0 ? (
          <Card className="p-10 text-center border-dashed">
            <CheckCircle2 className="w-10 h-10 text-slate-400 dark:text-neutral-500 mx-auto mb-3 opacity-60" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Pending Tasks</h4>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              You are all caught up. Click "Add Task" to create a new task.
            </p>
            <Button
              variant="secondary"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={openCreateModal}
              className="mt-4 text-xs"
            >
              Create New Task
            </Button>
          </Card>
        ) : (
          activeTasks.map((task) => (
            <Card
              key={task.id}
              className="p-5 flex items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4 min-w-0">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className="mt-0.5 w-5 h-5 rounded-full border-2 border-slate-400 dark:border-white/30 hover:border-slate-900 dark:hover:border-white flex items-center justify-center transition-colors shrink-0"
                >
                  <span className="sr-only">Complete task</span>
                </button>

                <div className="min-w-0 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Deadline & Reminder Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15">
                        <Calendar className="w-3 h-3 text-slate-900 dark:text-white" />
                        {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}
                      </span>
                    )}
                    {task.reminder ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-neutral-300">
                        <Bell className="w-3 h-3 text-slate-900 dark:text-white" /> Reminder On
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-neutral-500">
                        <BellOff className="w-3 h-3" /> Silent
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(task)}
                  className="p-2.5 rounded-full text-slate-400 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2.5 rounded-full text-slate-400 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="pt-6 space-y-4">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest py-2 border-t border-slate-200/80 dark:border-white/10"
          >
            <span>Completed Tasks ({completedTasks.length})</span>
            {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showCompleted && (
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <Card
                  key={task.id}
                  className="p-4 flex items-center justify-between gap-4 bg-slate-50 dark:bg-white/[0.02] opacity-70 border-slate-200/80 dark:border-white/10"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold line-through text-slate-400 dark:text-neutral-400 truncate">
                        {task.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (isListening) speechService.stopListening();
          setIsModalOpen(false);
        }}
        title={editingTaskId ? 'Edit Task' : 'Create Task'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                Task Title <span className="text-red-500 dark:text-white">*</span>
              </label>

              <button
                type="button"
                onClick={isListening ? handleStopVoice : handleStartVoice}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 hover:bg-slate-200 dark:hover:bg-white/20'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" /> Listening...
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" /> Voice Input
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              required
              placeholder="e.g., Complete project proposal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
            />

            {voiceError && <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{voiceError}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add extra context or steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Due Time (Optional)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-900 dark:text-white" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Enable Notification</p>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400">Notify at deadline with sound & vibration</p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={reminder}
              onChange={(e) => setReminder(e.target.checked)}
              className="w-5 h-5 rounded-full border-slate-400 dark:border-white/30 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTaskId ? 'Update Task' : 'Save Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
