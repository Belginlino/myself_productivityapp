import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { CheckSquare, Clock, Mic, MicOff } from 'lucide-react';
import { speechService } from '../../services/speechService';

export const QuickAddModal: React.FC = () => {
  const { isQuickAddOpen, toggleQuickAdd } = useAppStore();
  const { addTask } = useTaskStore();
  const { addRoutine } = useRoutineStore();

  const [itemType, setItemType] = useState<'task' | 'routine'>('task');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

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
        setVoiceError(err || 'Failed to capture voice.');
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (itemType === 'task') {
      addTask({
        title: title.trim(),
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        reminder: true,
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
    if (isListening) speechService.stopListening();
    toggleQuickAdd(false);
  };

  return (
    <Modal
      isOpen={isQuickAddOpen}
      onClose={() => {
        if (isListening) speechService.stopListening();
        toggleQuickAdd(false);
      }}
      title="Quick Add"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Item Type Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/10 dark:bg-white/10 rounded-full border border-black/5 dark:border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setItemType('task')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-xs transition-all ${
              itemType === 'task'
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Task
          </button>
          <button
            type="button"
            onClick={() => setItemType('routine')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-xs transition-all ${
              itemType === 'routine'
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> Routine
          </button>
        </div>

        {/* Title Input & Voice Microphone Button */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-neutral-300">
              {itemType === 'task' ? 'Task Title' : 'Routine Title'}{' '}
              <span className="text-white">*</span>
            </label>

            {itemType === 'task' && (
              <button
                type="button"
                onClick={isListening ? handleStopVoice : handleStartVoice}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" /> Listening...
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" /> Voice Task
                  </>
                )}
              </button>
            )}
          </div>

          <input
            type="text"
            required
            placeholder={itemType === 'task' ? 'e.g., Send status report' : 'e.g., Exercise & Stretch'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
          />

          {voiceError && <p className="text-[11px] text-red-400 mt-1">{voiceError}</p>}
        </div>

        {/* Task Specific Fields */}
        {itemType === 'task' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Routine Specific Fields */}
        {itemType === 'routine' && (
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Scheduled Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none"
            />
          </div>
        )}

        <div className="pt-2 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (isListening) speechService.stopListening();
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
    </Modal>
  );
};
