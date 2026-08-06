import React from 'react';
import { motion } from 'framer-motion';

interface WaveformAnimProps {
  isRecording: boolean;
  barCount?: number;
}

export const WaveformAnim: React.FC<WaveformAnimProps> = ({
  isRecording,
  barCount = 9,
}) => {
  return (
    <div className="flex items-center justify-center gap-1 h-8 px-3 py-1 bg-[#1B2435]/60 rounded-full border border-white/10">
      {Array.from({ length: barCount }).map((_, idx) => (
        <motion.span
          key={idx}
          animate={
            isRecording
              ? {
                  scaleY: [0.3, 1, 0.4, 0.9, 0.2],
                  height: ['8px', '28px', '12px', '24px', '8px'],
                }
              : { scaleY: 0.3, height: '8px' }
          }
          transition={
            isRecording
              ? {
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  delay: (idx * 0.1) % 0.4,
                  ease: 'easeInOut',
                }
              : { duration: 0.2 }
          }
          className="w-1 bg-[#C9F48A] rounded-full shadow-glow-accent origin-center"
        />
      ))}
    </div>
  );
};
