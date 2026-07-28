import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 amoled:bg-amoled-card border border-slate-200/80 dark:border-slate-800 amoled:border-amoled-border rounded-2xl p-5 ${
        hoverEffect ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
