import React from 'react';
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

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const h = parseInt(e.target.value, 10);
    onChange(to24Hour(h, minute, period));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = parseInt(e.target.value, 10);
    onChange(to24Hour(hour12, m, period));
  };

  const togglePeriod = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM';
    onChange(to24Hour(hour12, minute, newPeriod));
  };

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#1B2435] border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex-1 flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-1 font-mono text-sm font-bold text-white">
          <select
            value={hour12}
            onChange={handleHourChange}
            className="bg-[#1B2435] text-white font-bold cursor-pointer focus:outline-none rounded-lg px-1.5 py-1 hover:bg-white/10 border border-transparent focus:border-white/20"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h} className="bg-[#1B2435] text-white font-mono">
                {h < 10 ? `0${h}` : h}
              </option>
            ))}
          </select>
          <span className="text-white/60 font-bold">:</span>
          <select
            value={minute}
            onChange={handleMinuteChange}
            className="bg-[#1B2435] text-white font-bold cursor-pointer focus:outline-none rounded-lg px-1.5 py-1 hover:bg-white/10 border border-transparent focus:border-white/20"
          >
            {Array.from({ length: 60 }, (_, i) => i).map((m) => (
              <option key={m} value={m} className="bg-[#1B2435] text-white font-mono">
                {m < 10 ? `0${m}` : m}
              </option>
            ))}
          </select>
        </div>

        {/* AM / PM Toggle Pill Button */}
        <button
          type="button"
          onClick={togglePeriod}
          className="px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wider transition-all duration-200 active:scale-95 border border-white/10 hover:scale-105"
          style={{
            backgroundColor: period === 'PM' ? `${accentColor}25` : 'rgba(255,255,255,0.08)',
            color: period === 'PM' ? accentColor : '#ffffff',
            borderColor: period === 'PM' ? `${accentColor}50` : 'rgba(255,255,255,0.15)',
          }}
        >
          {period}
        </button>
      </div>
    </div>
  );
};
