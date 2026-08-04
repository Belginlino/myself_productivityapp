import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Mic,
  Square,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Star,
  ShieldAlert,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { VoiceNotePlayer } from '../../components/common/VoiceNotePlayer';
import { useTaskStore } from '../../store/useTaskStore';
import { TaskItem } from '../../types';
import { audioRecorderService } from '../../services/audioRecorderService';
import { requestNotificationPermissions } from '../../services/notificationService';
import { VoicePermissionModal } from '../../components/common/VoicePermissionModal';

export const TaskView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete } = useTaskStore();

  // Filter Tab State
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed' | 'today'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState(true);

  // Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | undefined>(undefined);
  const [recordedVoiceDuration, setRecordedVoiceDuration] = useState<number | undefined>(undefined);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // Collapsible Completed Tasks Section
  const [showCompletedSection, setShowCompletedSection] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering Logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'pending') return t.status === 'pending';
    if (filterTab === 'completed') return t.status === 'completed';
    if (filterTab === 'today') return t.dueDate === todayStr;
    return true;
  });

  const activeTasks = filteredTasks.filter((t) => t.status !== 'completed');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const openCreateModal = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setDueTime('');
    setReminder(true);
    setRecordedVoiceUrl(undefined);
    setRecordedVoiceDuration(undefined);
    setAudioError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate || '');
    setDueTime(task.dueTime || '');
    setReminder(task.reminder);
    setRecordedVoiceUrl(task.voiceNoteUrl);
    setRecordedVoiceDuration(task.voiceNoteDuration);
    setAudioError(null);
    setIsModalOpen(true);
  };

  const handleStartRecording = async () => {
    setAudioError(null);
    try {
      setIsRecording(true);
      setRecordingTime(0);
      await audioRecorderService.startRecording((seconds) => {
        setRecordingTime(seconds);
      });
    } catch (err: any) {
      setIsRecording(false);
      setAudioError(err.message || 'Failed to start microphone. Please enable voice permission.');
      setIsPermissionModalOpen(true);
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await audioRecorderService.stopRecording();
      setIsRecording(false);
      setRecordedVoiceUrl(result.audioUrl);
      setRecordedVoiceDuration(result.duration);
    } catch (err: any) {
      setIsRecording(false);
      setAudioError(err.message || 'Failed to save audio recording.');
    }
  };

  const handleCancelRecording = () => {
    audioRecorderService.cancelRecording();
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !recordedVoiceUrl) return;

    if (reminder && dueDate) {
      await requestNotificationPermissions();
    }

    const taskTitle =
      title.trim() ||
      `Voice Note ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: taskTitle,
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        reminder,
        voiceNoteUrl: recordedVoiceUrl,
        voiceNoteDuration: recordedVoiceDuration,
      });
    } else {
      addTask({
        title: taskTitle,
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        reminder,
        voiceNoteUrl: recordedVoiceUrl,
        voiceNoteDuration: recordedVoiceDuration,
      });
    }

    setIsModalOpen(false);
  };

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 pb-16"
    >
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20 shadow-sm">
              <CheckSquare className="w-5 h-5" />
            </div>
            Task Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1 font-medium">
            Organize tasks, set reminders, and record WhatsApp-style voice messages.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
          className="shadow-glow-slate"
        >
          Add Task
        </Button>
      </div>

      {/* Filter Tabs & Search Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2.5 rounded-3xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Tasks', count: tasks.length },
            { id: 'pending', label: 'Pending', count: tasks.filter((t) => t.status === 'pending').length },
            { id: 'today', label: 'Due Today', count: tasks.filter((t) => t.dueDate === todayStr).length },
            { id: 'completed', label: 'Completed', count: tasks.filter((t) => t.status === 'completed').length },
          ].map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`relative px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTaskTab"
                    className="absolute inset-0 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span
                  className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-black'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-bold'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
          />
        </div>
      </div>

      {/* Active Tasks List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-widest px-1">
          Active Tasks ({activeTasks.length})
        </h3>

        <AnimatePresence mode="popLayout">
          {activeTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-12 text-center border-dashed space-y-3">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {filterTab === 'completed'
                      ? 'No Completed Tasks Yet'
                      : filterTab === 'today'
                      ? 'No Tasks Due Today'
                      : 'No Pending Tasks'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                    You are all caught up! Click "Add Task" to record a new task or voice note.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={openCreateModal}
                  className="mt-2 text-xs"
                >
                  Create New Task
                </Button>
              </Card>
            </motion.div>
          ) : (
            activeTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-4 sm:p-5 rounded-3xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 transition-all flex items-center justify-between gap-4 group shadow-sm"
              >
                {/* Square Checkbox */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleTaskComplete(task.id)}
                  className="w-5.5 h-5.5 rounded-lg border-2 border-slate-400 dark:border-white/40 group-hover:border-slate-900 dark:group-hover:border-white flex items-center justify-center transition-all shrink-0 mt-0.5"
                >
                  <Check className="w-3.5 h-3.5 text-transparent stroke-[3]" />
                </motion.button>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed font-medium">
                      {task.description}
                    </p>
                  )}

                  {/* Audio Player */}
                  {task.voiceNoteUrl && (
                    <div className="pt-1">
                      <VoiceNotePlayer
                        audioUrl={task.voiceNoteUrl}
                        duration={task.voiceNoteDuration}
                      />
                    </div>
                  )}

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-neutral-400">
                    {task.dueDate && (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[11px] border border-red-500/20">
                        <Calendar className="w-3 h-3" /> {task.dueDate}{' '}
                        {task.dueTime ? `@ ${task.dueTime}` : ''}
                      </span>
                    )}
                    {task.reminder && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                        <Bell className="w-3 h-3 text-indigo-500" /> Reminder
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openEditModal(task)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                    title="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                  <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400 opacity-90 ml-1" />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Completed Tasks Collapsible Section */}
      {completedTasks.length > 0 && (
        <div className="pt-6 space-y-4">
          <button
            onClick={() => setShowCompletedSection(!showCompletedSection)}
            className="flex items-center justify-between w-full text-xs font-extrabold text-slate-400 dark:text-neutral-400 uppercase tracking-widest py-2 border-t border-slate-200/80 dark:border-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>Completed Tasks ({completedTasks.length})</span>
            {showCompletedSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showCompletedSection && (
            <div className="space-y-3">
              <AnimatePresence>
                {completedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-2xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => toggleTaskComplete(task.id)}
                        className="w-5.5 h-5.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shrink-0 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </motion.button>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold line-through text-slate-400 dark:text-neutral-500 truncate">
                          {task.title}
                        </h4>
                        {task.voiceNoteUrl && (
                          <div className="pt-1 opacity-60">
                            <VoiceNotePlayer
                              audioUrl={task.voiceNoteUrl}
                              duration={task.voiceNoteDuration}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (isRecording) handleCancelRecording();
          setIsModalOpen(false);
        }}
        title={editingTaskId ? 'Edit Task' : 'Create Task / Voice Message'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Audio Voice Recorder Box */}
          <div className="p-5 rounded-3xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-indigo-500" /> WhatsApp Voice Message
              </span>

              {isRecording && (
                <span className="text-xs font-mono font-black text-red-500 animate-pulse flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  {formatRecordingTime(recordingTime)}
                </span>
              )}
            </div>

            {/* Recording Actions */}
            {isRecording ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-red-600 transition-all"
                >
                  <Square className="w-4 h-4 fill-white" /> Stop & Attach Audio
                </button>
                <button
                  type="button"
                  onClick={handleCancelRecording}
                  className="p-3 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"
                  title="Discard recording"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : recordedVoiceUrl ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                  Recorded Audio Note:
                </p>
                <VoiceNotePlayer
                  audioUrl={recordedVoiceUrl}
                  duration={recordedVoiceDuration}
                  onDelete={() => {
                    setRecordedVoiceUrl(undefined);
                    setRecordedVoiceDuration(undefined);
                  }}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartRecording}
                className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-98 transition-all"
              >
                <Mic className="w-4 h-4" /> Click to Record Voice Message
              </button>
            )}

            {audioError && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-red-500 font-medium">{audioError}</p>
                <button
                  type="button"
                  onClick={() => setIsPermissionModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Enable Voice Permission
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
              Task Title (Optional if voice recorded)
            </label>
            <input
              type="text"
              placeholder="e.g., Prepare presentation slides..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
            />
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Reminder Switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">Enable Notification</p>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400">Notify at deadline with chime & vibration</p>
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

      <VoicePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onGranted={() => {
          setAudioError(null);
          handleStartRecording();
        }}
      />
    </motion.div>
  );
};
