import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'bg-indigo-600',
  height = 'h-2',
  showPercentage = false,
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-200 dark:bg-slate-800 amoled:bg-amoled-border rounded-full overflow-hidden ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 inline-block font-medium">
          {normalizedProgress}%
        </span>
      )}
    </div>
  );
};
