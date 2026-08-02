import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { CheckSquare, Clock, Mic, Square, Trash2, ShieldAlert } from 'lucide-react';
import { audioRecorderService } from '../../services/audioRecorderService';
import { VoiceNotePlayer } from '../common/VoiceNotePlayer';
import { VoicePermissionModal } from '../common/VoicePermissionModal';

export const QuickAddModal: React.FC = () => {
  const { isQuickAddOpen, toggleQuickAdd } = useAppStore();
  const { addTask } = useTaskStore();
  const { addRoutine } = useRoutineStore();

  const [itemType, setItemType] = useState<'task' | 'routine'>('task');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  // Audio Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | undefined>(undefined);
  const [recordedVoiceDuration, setRecordedVoiceDuration] = useState<number | undefined>(undefined);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

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
      setAudioError(err.message || 'Microphone access failed. Please enable voice permission.');
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
      setAudioError(err.message || 'Failed to save recording.');
    }
  };

  const handleCancelRecording = () => {
    audioRecorderService.cancelRecording();
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !recordedVoiceUrl) return;

    if (itemType === 'task') {
      const taskTitle = title.trim() || `Voice Note ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      addTask({
        title: taskTitle,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        reminder: true,
        voiceNoteUrl: recordedVoiceUrl,
        voiceNoteDuration: recordedVoiceDuration,
      });
    } else {
      addRoutine({
        title: title.trim(),
        time: time || '08:00',
        repeatEveryDay: true,
        reminder: true,
      });
    }

    setTitle('');
    setDueDate('');
    setDueTime('');
    setTime('08:00');
    setRecordedVoiceUrl(undefined);
    setRecordedVoiceDuration(undefined);
    if (isRecording) handleCancelRecording();
    toggleQuickAdd(false);
  };

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Modal
      isOpen={isQuickAddOpen}
      onClose={() => {
        if (isRecording) handleCancelRecording();
        toggleQuickAdd(false);
      }}
      title="Quick Add"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Item Type Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-white/10 rounded-full border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setItemType('task')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-xs transition-all ${
              itemType === 'task'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Task
          </button>
          <button
            type="button"
            onClick={() => setItemType('routine')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-xs transition-all ${
              itemType === 'routine'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> Routine
          </button>
        </div>

        {/* WhatsApp Voice Note Recording section for Tasks */}
        {itemType === 'task' && (
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
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">Recorded Voice Message:</p>
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
                <Mic className="w-4 h-4" /> Click to Record Voice Message
              </button>
            )}

            {audioError && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-red-500 font-medium">{audioError}</p>
                <button
                  type="button"
                  onClick={() => setIsPermissionModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Enable Voice Permission
                </button>
              </div>
            )}
          </div>
        )}

        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
            {itemType === 'task' ? 'Task Title (Optional if voice recorded)' : 'Routine Title'}{' '}
            {itemType === 'routine' && <span className="text-red-500 dark:text-white">*</span>}
          </label>

          <input
            type="text"
            required={itemType === 'routine' && !recordedVoiceUrl}
            placeholder={itemType === 'task' ? 'e.g., Internship report, Study Java' : 'e.g., Exercise & Stretch'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
          />
        </div>

        {/* Task Specific Fields */}
        {itemType === 'task' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Due Date
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
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Routine Specific Fields */}
        {itemType === 'routine' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-2">
              Scheduled Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        )}

        <div className="pt-2 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (isRecording) handleCancelRecording();
              toggleQuickAdd(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create {itemType === 'task' ? 'Task' : 'Routine'}
          </Button>
        </div>
      </form>

      <VoicePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onGranted={() => {
          setAudioError(null);
          handleStartRecording();
        }}
      />
    </Modal>
  );
};
