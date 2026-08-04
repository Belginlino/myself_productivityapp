import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  // Waveform bars simulation
  const waveformHeights = [40, 75, 50, 90, 60, 100, 45, 80, 55, 95, 70, 40];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/15 backdrop-blur-xl max-w-xs sm:max-w-sm w-full my-1.5 shadow-sm hover:border-slate-300 dark:hover:border-white/25 transition-all"
    >
      {/* Play/Pause Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shrink-0 shadow-md hover:scale-105 transition-all"
        title={isPlaying ? 'Pause voice message' : 'Play voice message'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </motion.button>

      {/* Waveform & Time */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <Mic className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> Audio Note
          </span>
          <span>{isPlaying ? formatTime(currentTime) : formatTime(totalDuration)}</span>
        </div>

        {/* Animated Waveform Visualizer */}
        <div className="flex items-center gap-1 h-3.5 px-0.5">
          {waveformHeights.map((h, idx) => (
            <motion.div
              key={idx}
              animate={{
                scaleY: isPlaying ? [0.3, h / 100, 0.3] : 0.3,
              }}
              transition={{
                duration: 0.6,
                repeat: isPlaying ? Infinity : 0,
                repeatType: 'reverse',
                delay: idx * 0.05,
              }}
              className={`flex-1 rounded-full transition-colors ${
                (idx / waveformHeights.length) * 100 <= progressPercent
                  ? 'bg-indigo-600 dark:bg-indigo-400'
                  : 'bg-slate-300 dark:bg-white/20'
              }`}
              style={{ height: '100%', transformOrigin: 'bottom' }}
            />
          ))}
        </div>
      </div>

      {/* Delete Option */}
      {onDelete && (
        <motion.button
          whileTap={{ scale: 0.9 }}
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
        </motion.button>
      )}
    </div>
  );
};
