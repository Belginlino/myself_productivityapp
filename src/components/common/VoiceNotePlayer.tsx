import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic, Trash2 } from 'lucide-react';

interface VoiceNotePlayerProps {
  audioUrl: string;
  duration?: number;
  onDelete?: () => void;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  duration = 0,
  onDelete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    audio.ontimeupdate = () => {
      setCurrentTime(Math.round(audio.currentTime));
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio play error:', err));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-3 p-2.5 px-3.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 backdrop-blur-md max-w-xs sm:max-w-sm w-full my-1 shadow-sm"
    >
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition-all"
        title={isPlaying ? 'Pause voice message' : 'Play voice message'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      {/* Mic Icon & Waveform Progress */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-600 dark:text-neutral-300">
          <span className="flex items-center gap-1">
            <Mic className="w-3 h-3 text-slate-900 dark:text-white" /> Voice Note
          </span>
          <span>
            {isPlaying ? formatTime(currentTime) : formatTime(totalDuration)}
          </span>
        </div>

        {/* Progress Wavebar */}
        <div className="relative w-full h-1.5 bg-slate-200 dark:bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Delete Voice Note Option */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (audioRef.current) audioRef.current.pause();
            onDelete();
          }}
          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0"
          title="Delete voice message"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
