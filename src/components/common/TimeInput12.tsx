import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X } from 'lucide-react';
import { parseTimeTo12Hour, to24Hour } from '../../utils/timeUtils';

interface TimeInput12Props {
  value: string;
  onChange: (newValue: string) => void;
  accentColor?: string;
}

export const TimeInput12: React.FC<TimeInput12Props> = ({
  value,
  onChange,
  accentColor = '#C9F48A',
}) => {
  const { hour12, minute, period } = parseTimeTo12Hour(value);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'hours' | 'minutes'>('hours');
  const clockRef = useRef<HTMLDivElement>(null);

  const handleHourSelect = (h: number) => {
    onChange(to24Hour(h, minute, period));
    setMode('minutes'); // Auto-switch to minutes for seamless flow
  };

  const handleMinuteSelect = (m: number) => {
    onChange(to24Hour(hour12, m, period));
  };

  const togglePeriod = (newPeriod: 'AM' | 'PM') => {
    onChange(to24Hour(hour12, minute, newPeriod));
  };

  // Clock Hand Angles
  const hourAngle = (hour12 % 12) * 30 + (minute / 60) * 30;
  const minuteAngle = minute * 6;

  // Clock Face Drag / Click Handler
  const handleClockInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - cx;
    const dy = clientY - cy;

    // Angle from 12 o'clock position
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (mode === 'hours') {
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      handleHourSelect(h);
    } else {
      let m = Math.round(angle / 6);
      if (m === 60) m = 0;
      handleMinuteSelect(m);
    }
  };

  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const presets = [
    { label: '08:00 AM', h: 8, m: 0, p: 'AM' as const },
    { label: '12:00 PM', h: 12, m: 0, p: 'PM' as const },
    { label: '05:00 PM', h: 5, m: 0, p: 'PM' as const },
    { label: '09:00 PM', h: 9, m: 0, p: 'PM' as const },
  ];

  return (
    <>
      {/* Trigger Bar with Mini Live Analog Clock Preview */}
      <button
        type="button"
        onClick={() => {
          setMode('hours');
          setIsOpen(true);
        }}
        className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-2xl bg-[#1B2435] border border-white/10 hover:border-white/25 transition-all text-left group min-w-0"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Live SVG Analog Clock Icon */}
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" className="text-white/30" />
              {/* Hour hand */}
              <line
                x1="12"
                y1="12"
                x2={12 + 4.5 * Math.sin((hourAngle * Math.PI) / 180)}
                y2={12 - 4.5 * Math.cos((hourAngle * Math.PI) / 180)}
                stroke={accentColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Minute hand */}
              <line
                x1="12"
                y1="12"
                x2={12 + 6.5 * Math.sin((minuteAngle * Math.PI) / 180)}
                y2={12 - 6.5 * Math.cos((minuteAngle * Math.PI) / 180)}
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="1.2" fill={accentColor} />
            </svg>
          </div>

          <div className="flex items-baseline gap-1 font-mono text-sm font-bold text-white min-w-0">
            <span>{hour12 < 10 ? `0${hour12}` : hour12}</span>
            <span className="text-white/40 animate-pulse">:</span>
            <span>{minute < 10 ? `0${minute}` : minute}</span>
            <span className="text-xs font-black ml-1 text-white/80 px-1.5 py-0.5 rounded-md bg-white/10">
              {period}
            </span>
          </div>
        </div>

        <div className="text-[11px] font-bold text-white/50 group-hover:text-white/80 transition-colors flex items-center gap-1 shrink-0">
          <Clock className="w-3.5 h-3.5" /> Analog
        </div>
      </button>

      {/* Analog Clock Modal Portal */}
      {isOpen &&
        createPortal(
          <AnimatePresence>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="relative w-full max-w-sm bg-[#23324A] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden p-5 flex flex-col items-center gap-4"
              >
                {/* Header */}
                <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#C9F48A]" />
                    <span className="text-sm font-bold tracking-wide">Analog Clock Picker</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Selected Time Digital Header & AM/PM Selector */}
                <div className="flex items-center justify-between w-full bg-[#1B2435] p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-1 font-mono text-2xl font-black text-white">
                    <button
                      type="button"
                      onClick={() => setMode('hours')}
                      className={`px-2 py-1 rounded-xl transition-all ${
                        mode === 'hours'
                          ? 'bg-[#C9F48A] text-[#1B2435] shadow-glow-accent'
                          : 'hover:bg-white/10 text-white/80'
                      }`}
                    >
                      {hour12 < 10 ? `0${hour12}` : hour12}
                    </button>
                    <span className="text-white/40">:</span>
                    <button
                      type="button"
                      onClick={() => setMode('minutes')}
                      className={`px-2 py-1 rounded-xl transition-all ${
                        mode === 'minutes'
                          ? 'bg-[#37C7F4] text-[#1B2435] shadow-glow-blue'
                          : 'hover:bg-white/10 text-white/80'
                      }`}
                    >
                      {minute < 10 ? `0${minute}` : minute}
                    </button>
                  </div>

                  {/* AM / PM Toggle */}
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => togglePeriod('AM')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        period === 'AM'
                          ? 'bg-[#C9F48A] text-[#1B2435] shadow-md'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePeriod('PM')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        period === 'PM'
                          ? 'bg-[#C9F48A] text-[#1B2435] shadow-md'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-2 p-1 bg-[#1B2435] rounded-xl border border-white/10 w-full">
                  <button
                    type="button"
                    onClick={() => setMode('hours')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === 'hours' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Select Hour (1-12)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('minutes')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === 'minutes' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Select Minute (0-59)
                  </button>
                </div>

                {/* Analog Clock Dial Face */}
                <div
                  ref={clockRef}
                  onClick={handleClockInteraction}
                  className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-full bg-gradient-to-b from-[#1B2435] to-[#141C2B] border-4 border-white/15 shadow-2xl flex items-center justify-center cursor-pointer select-none touch-none my-1"
                >
                  {/* Outer ticks ring */}
                  <div className="absolute inset-2 rounded-full border border-dashed border-white/10 pointer-events-none" />

                  {/* Center Pivot Pin */}
                  <div
                    className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg z-20"
                    style={{ backgroundColor: accentColor }}
                  />

                  {/* Hour Hand */}
                  <div
                    className="absolute bottom-1/2 left-1/2 w-1.5 bg-white/90 rounded-full origin-bottom z-10 transition-transform duration-150 ease-out"
                    style={{
                      height: '30%',
                      marginLeft: '-3px',
                      transform: `rotate(${hourAngle}deg)`,
                    }}
                  />

                  {/* Minute Hand */}
                  <div
                    className="absolute bottom-1/2 left-1/2 w-1 rounded-full origin-bottom z-10 transition-transform duration-150 ease-out shadow-glow-accent"
                    style={{
                      height: '42%',
                      marginLeft: '-2px',
                      transform: `rotate(${minuteAngle}deg)`,
                      backgroundColor: accentColor,
                    }}
                  />

                  {/* Numbers Around Dial */}
                  {mode === 'hours'
                    ? hoursList.map((h) => {
                        const angleDeg = h * 30 - 90;
                        const rad = (angleDeg * Math.PI) / 180;
                        const r = 88; // radius in px
                        const x = Math.round(r * Math.cos(rad));
                        const y = Math.round(r * Math.sin(rad));
                        const isSelected = hour12 === h;

                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHourSelect(h);
                            }}
                            style={{
                              transform: `translate(${x}px, ${y}px)`,
                            }}
                            className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all z-20 ${
                              isSelected
                                ? 'bg-[#C9F48A] text-[#1B2435] scale-125 shadow-glow-accent font-extrabold'
                                : 'text-white/80 hover:bg-white/20 hover:scale-110'
                            }`}
                          >
                            {h}
                          </button>
                        );
                      })
                    : minutesList.map((m) => {
                        const angleDeg = m * 6 - 90;
                        const rad = (angleDeg * Math.PI) / 180;
                        const r = 88; // radius in px
                        const x = Math.round(r * Math.cos(rad));
                        const y = Math.round(r * Math.sin(rad));
                        const isSelected = Math.abs(minute - m) < 3 || (m === 55 && minute >= 57);

                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMinuteSelect(m);
                            }}
                            style={{
                              transform: `translate(${x}px, ${y}px)`,
                            }}
                            className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-all z-20 ${
                              isSelected
                                ? 'bg-[#37C7F4] text-[#1B2435] scale-125 shadow-glow-blue font-extrabold'
                                : 'text-white/80 hover:bg-white/20 hover:scale-110'
                            }`}
                          >
                            {m < 10 ? `0${m}` : m}
                          </button>
                        );
                      })}
                </div>

                {/* Presets Row */}
                <div className="grid grid-cols-4 gap-1.5 w-full">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        onChange(to24Hour(p.h, p.m, p.p));
                      }}
                      className="py-1.5 px-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono font-bold text-white/80 hover:text-white transition-colors text-center"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Done Confirm Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-bold text-xs shadow-glow-accent hover:bg-[#b1e06d] transition-colors flex items-center justify-center gap-2 mt-1"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> Set Selected Time
                </button>
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
