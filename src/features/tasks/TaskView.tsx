import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Mic,
  Square,
  Bell,
  BellOff,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Star,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { VoiceNotePlayer } from '../../components/common/VoiceNotePlayer';
import { useTaskStore } from '../../store/useTaskStore';
import { TaskItem } from '../../types';
import { audioRecorderService } from '../../services/audioRecorderService';
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

  // Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | undefined>(undefined);
  const [recordedVoiceDuration, setRecordedVoiceDuration] = useState<number | undefined>(undefined);
  const [audioError, setAudioError] = useState<string | null>(null);

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
      setAudioError(err.message || 'Failed to start microphone.');
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

    const taskTitle = title.trim() || `Voice Note ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

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
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <CheckSquare className="w-8 h-8 text-slate-900 dark:text-white" />
            Task Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Organize tasks and record WhatsApp-style voice messages.
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

      {/* Active Tasks List - Styled to match user image screenshot */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest px-1">
          Tasks ({activeTasks.length})
        </h3>

        {activeTasks.length === 0 ? (
          <Card className="p-10 text-center border-dashed">
            <CheckCircle2 className="w-10 h-10 text-slate-400 dark:text-neutral-500 mx-auto mb-3 opacity-60" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Pending Tasks</h4>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              You are all caught up. Click "Add Task" or record a voice message.
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
            <div
              key={task.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25 transition-all flex items-center justify-between gap-4 group shadow-sm"
            >
              {/* Left Circle Checkbox */}
              <button
                onClick={() => toggleTaskComplete(task.id)}
                className="w-6 h-6 rounded-full border-2 border-slate-400 dark:border-white/40 hover:border-slate-900 dark:hover:border-white flex items-center justify-center transition-colors shrink-0"
              >
                <Circle className="w-5 h-5 text-transparent" />
              </button>

              {/* Center Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {task.title}
                </h4>

                {task.description && (
                  <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                    {task.description}
                  </p>
                )}

                {/* Audio Voice Note Player (WhatsApp Style) */}
                {task.voiceNoteUrl && (
                  <div className="pt-1">
                    <VoiceNotePlayer
                      audioUrl={task.voiceNoteUrl}
                      duration={task.voiceNoteDuration}
                    />
                  </div>
                )}

                {/* Subtitle & Date pill */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-500 dark:text-neutral-400">
                  <span className="font-medium">Tasks</span>
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-red-500 font-semibold text-[11px]">
                      • <Calendar className="w-3 h-3" /> {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}
                    </span>
                  )}
                  {task.reminder && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-neutral-400">
                      • <Bell className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Right Star & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditModal(task)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Star className="w-4 h-4 text-pink-300 dark:text-pink-400 fill-pink-300 dark:fill-pink-400 opacity-80" />
              </div>
            </div>
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
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] opacity-70 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-4"
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
                    className="p-2 text-slate-400 dark:text-neutral-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (isRecording) handleCancelRecording();
          setIsModalOpen(false);
        }}
        title={editingTaskId ? 'Edit Task' : 'Create Task / Voice Message'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Audio Voice Recorder (WhatsApp style) */}
          <div className="p-4 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-slate-900 dark:text-white" /> WhatsApp Voice Message
              </span>

              {isRecording && (
                <span className="text-xs font-mono font-bold text-red-500 animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
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
                  className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-red-600 transition-all"
                >
                  <Square className="w-4 h-4 fill-white" /> Stop & Attach Audio
                </button>
                <button
                  type="button"
                  onClick={handleCancelRecording}
                  className="p-2.5 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                  title="Discard recording"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : recordedVoiceUrl ? (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">Recorded Audio Message:</p>
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
                className="w-full py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-98 transition-all"
              >
                <Mic className="w-4 h-4" /> Hold / Click to Record Voice Message
              </button>
            )}

            {audioError && <p className="text-[11px] text-red-500 font-medium">{audioError}</p>}
          </div>

          {/* Task Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
              Task Title (Optional if voice recorded)
            </label>
            <input
              type="text"
              placeholder="e.g., Internship report, Study Java..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add additional text details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
            />
          </div>

          {/* Due Date & Time */}
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

          {/* Reminder Toggle */}
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
