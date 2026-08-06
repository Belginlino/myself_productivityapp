import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomSheet } from '../ui/BottomSheet';
import { WaveformAnim } from '../ui/WaveformAnim';
import { useAppStore } from '../../store/useAppStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import {
  CheckSquare,
  Clock,
  Mic,
  Square,
  Trash2,
  Bell,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { speechService } from '../../services/speechService';
import { audioRecorderService } from '../../services/audioRecorderService';
import { VoiceNotePlayer } from '../common/VoiceNotePlayer';
import { VoicePermissionModal } from '../common/VoicePermissionModal';
import { TimeInput12 } from '../common/TimeInput12';

export const QuickAddModal: React.FC = () => {
  const { isQuickAddOpen, toggleQuickAdd } = useAppStore();
  const { addTask } = useTaskStore();
  const { addRoutine } = useRoutineStore();

  const [itemType, setItemType] = useState<'task' | 'routine'>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('08:00');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('09:00');
  const [reminder, setReminder] = useState(true);

  // Speech Recognition & Voice Note States
  const [isSpeechListening, setIsSpeechListening] = useState(false);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | undefined>(undefined);
  const [recordedVoiceDuration, setRecordedVoiceDuration] = useState<number | undefined>(undefined);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // Default due date to today YYYY-MM-DD
  useEffect(() => {
    if (isQuickAddOpen && !dueDate) {
      setDueDate(new Date().toISOString().split('T')[0]);
    }
  }, [isQuickAddOpen, dueDate]);

  // Speech to Text trigger
  const handleToggleSpeechRecognition = () => {
    setAudioError(null);
    if (isSpeechListening) {
      speechService.stopListening();
      setIsSpeechListening(false);
    } else {
      setIsSpeechListening(true);
      speechService.startListening({
        onResult: (transcript) => {
          setTitle(transcript);
        },
        onError: (err) => {
          setIsSpeechListening(false);
          setAudioError(err);
        },
        onEnd: () => {
          setIsSpeechListening(false);
        },
      });
    }
  };

  // Audio Note Recording
  const handleStartAudioRecording = async () => {
    setAudioError(null);
    try {
      setIsAudioRecording(true);
      setRecordingTime(0);
      await audioRecorderService.startRecording((seconds) => {
        setRecordingTime(seconds);
      });
    } catch (err: any) {
      setIsAudioRecording(false);
      setAudioError(err.message || 'Microphone access failed.');
      setIsPermissionModalOpen(true);
    }
  };

  const handleStopAudioRecording = async () => {
    try {
      const result = await audioRecorderService.stopRecording();
      setIsAudioRecording(false);
      setRecordedVoiceUrl(result.audioUrl);
      setRecordedVoiceDuration(result.duration);
    } catch (err: any) {
      setIsAudioRecording(false);
      setAudioError(err.message || 'Failed to save recording.');
    }
  };

  const handleCancelAudioRecording = () => {
    audioRecorderService.cancelRecording();
    setIsAudioRecording(false);
    setRecordingTime(0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !recordedVoiceUrl) return;

    try {
      if (itemType === 'task') {
        const taskTitle =
          title.trim() ||
          `Voice Task ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        addTask({
          title: taskTitle,
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          dueTime: dueTime || undefined,
          reminder,
          voiceNoteUrl: recordedVoiceUrl,
          voiceNoteDuration: recordedVoiceDuration,
        });
      } else {
        addRoutine({
          title: title.trim(),
          time: time || '08:00',
          repeatEveryDay: true,
          reminder,
        });
      }

      // Reset
      setTitle('');
      setDescription('');
      setRecordedVoiceUrl(undefined);
      setRecordedVoiceDuration(undefined);
      if (isAudioRecording) handleCancelAudioRecording();
      if (isSpeechListening) speechService.stopListening();
      toggleQuickAdd(false);
    } catch (err) {
      console.error('Error saving item:', err);
    }
  };

  return (
    <>
      <BottomSheet
        isOpen={isQuickAddOpen}
        onClose={() => {
          if (isAudioRecording) handleCancelAudioRecording();
          if (isSpeechListening) speechService.stopListening();
          toggleQuickAdd(false);
        }}
        title={`New ${itemType === 'task' ? 'Task' : 'Daily Routine'}`}
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Item Type Selector */}
          <div className="relative flex items-center p-1 bg-[#1B2435] rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setItemType('task')}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                itemType === 'task' ? 'text-[#1B2435]' : 'text-white/60 hover:text-white'
              }`}
            >
              {itemType === 'task' && (
                <motion.div
                  layoutId="quickAddType"
                  className="absolute inset-0 bg-[#C9F48A] rounded-xl shadow-glow-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <CheckSquare className="relative z-10 w-4 h-4" />
              <span className="relative z-10">Task</span>
            </button>

            <button
              type="button"
              onClick={() => setItemType('routine')}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                itemType === 'routine' ? 'text-[#1B2435]' : 'text-white/60 hover:text-white'
              }`}
            >
              {itemType === 'routine' && (
                <motion.div
                  layoutId="quickAddType"
                  className="absolute inset-0 bg-[#37C7F4] rounded-xl shadow-glow-blue"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Clock className="relative z-10 w-4 h-4" />
              <span className="relative z-10">Routine</span>
            </button>
          </div>

          {/* Speech-to-Text Voice Task Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1B2435] border border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSpeechRecognition}
                className={`p-3 rounded-xl transition-transform active:scale-95 ${
                  isSpeechListening
                    ? 'bg-[#FF5D73] text-white animate-pulse'
                    : 'bg-[#C9F48A] text-[#1B2435] shadow-glow-accent'
                }`}
                title="Tap to speak title"
              >
                <Mic className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9F48A]" /> Voice Task Creation
                </p>
                <p className="text-[11px] text-[#A8B3C7]">
                  {isSpeechListening ? 'Listening... Speak your task now' : 'Tap mic to speak your task title'}
                </p>
              </div>
            </div>

            {isSpeechListening && <WaveformAnim isRecording={true} barCount={7} />}
          </div>

          {/* Task Title Field */}
          <div>
            <label className="block text-xs font-bold text-[#A8B3C7] uppercase tracking-wider mb-2">
              {itemType === 'task' ? 'Task Title' : 'Routine Name'}{' '}
              <span className="text-[#FF5D73]">*</span>
            </label>
            <input
              type="text"
              required={!recordedVoiceUrl}
              placeholder={
                itemType === 'task'
                  ? 'e.g., Design UI layout for client'
                  : 'e.g., Morning Meditation & Workout'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-[#1B2435] text-sm font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9F48A]"
            />
          </div>

          {/* Description */}
          {itemType === 'task' && (
            <div>
              <label className="block text-xs font-bold text-[#A8B3C7] uppercase tracking-wider mb-2">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Add subtasks or extra details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-[#1B2435] text-xs font-medium text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9F48A] resize-none"
              />
            </div>
          )}

          {/* Date & Time Picker */}
          {itemType === 'task' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#A8B3C7] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl border border-white/10 bg-[#1B2435] text-xs font-semibold text-white focus:outline-none focus:border-[#C9F48A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A8B3C7] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Time
                </label>
                <TimeInput12 value={dueTime} onChange={setDueTime} accentColor="#C9F48A" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-[#A8B3C7] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Scheduled Time
              </label>
              <TimeInput12 value={time} onChange={setTime} accentColor="#37C7F4" />
            </div>
          )}

          {/* Voice Audio Note Attachment */}
          {itemType === 'task' && (
            <div className="p-4 rounded-2xl bg-[#1B2435] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#37C7F4]" /> Voice Audio Attachment
                </span>

                {isAudioRecording && (
                  <span className="text-xs font-mono font-bold text-[#FF5D73] animate-pulse">
                    Recording {recordingTime}s
                  </span>
                )}
              </div>

              {isAudioRecording ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleStopAudioRecording}
                    className="flex-1 py-2.5 rounded-xl bg-[#FF5D73] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-red-600 transition-colors"
                  >
                    <Square className="w-4 h-4 fill-white" /> Stop & Attach Audio
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAudioRecording}
                    className="p-2.5 rounded-xl text-white/50 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : recordedVoiceUrl ? (
                <VoiceNotePlayer
                  audioUrl={recordedVoiceUrl}
                  duration={recordedVoiceDuration}
                  onDelete={() => {
                    setRecordedVoiceUrl(undefined);
                    setRecordedVoiceDuration(undefined);
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={handleStartAudioRecording}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Mic className="w-4 h-4 text-[#37C7F4]" /> Record Audio Note
                </button>
              )}
            </div>
          )}

          {/* Reminder Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1B2435] border border-white/10">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-[#C9F48A]" />
              <span className="text-xs font-bold text-white">Deadline Local Notification</span>
            </div>
            <button
              type="button"
              onClick={() => setReminder(!reminder)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                reminder ? 'bg-[#C9F48A]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#1B2435] transition-transform ${
                  reminder ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                if (isAudioRecording) handleCancelAudioRecording();
                if (isSpeechListening) speechService.stopListening();
                toggleQuickAdd(false);
              }}
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-bold text-xs shadow-glow-accent hover:bg-[#b1e06d] transition-colors"
            >
              Save {itemType === 'task' ? 'Task' : 'Routine'}
            </motion.button>
          </div>
        </form>
      </BottomSheet>

      <VoicePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onGranted={() => {
          setAudioError(null);
          handleStartAudioRecording();
        }}
      />
    </>
  );
};
