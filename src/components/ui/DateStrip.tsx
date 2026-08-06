import React, { useRef, useEffect } from 'react';
import { format, addDays, isSameDay, subDays } from 'date-fns';
import { motion } from 'framer-motion';

interface DateStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  daysRange?: number; // Days to generate around selectedDate
}

export const DateStrip: React.FC<DateStripProps> = ({
  selectedDate,
  onSelectDate,
  daysRange = 15,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate array of dates centered around today or selectedDate
  const dates: Date[] = [];
  const start = subDays(selectedDate, Math.floor(daysRange / 2));
  for (let i = 0; i < daysRange; i++) {
    dates.push(addDays(start, i));
  }

  // Scroll active date into view
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
    >
      {dates.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const dayNumber = format(date, 'd');
        const weekday = format(date, 'EEE');

        return (
          <motion.button
            key={date.toISOString()}
            data-active={isSelected}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelectDate(date)}
            className={`flex flex-col items-center justify-center min-w-[56px] py-3.5 px-3 rounded-full transition-all duration-200 ${
              isSelected
                ? 'bg-[#C9F48A] text-[#1B2435] shadow-glow-accent font-bold ring-2 ring-[#C9F48A]/50 scale-105'
                : 'bg-[#23324A] text-white/70 hover:text-white hover:bg-[#2C3E5B] border border-white/5'
            }`}
          >
            <span className={`text-lg font-bold leading-none ${isSelected ? 'text-[#1B2435]' : 'text-white'}`}>
              {dayNumber}
            </span>
            <span
              className={`text-xs mt-1 font-medium uppercase tracking-wider ${
                isSelected ? 'text-[#1B2435]/80' : 'text-[#A8B3C7]'
              }`}
            >
              {weekday}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
