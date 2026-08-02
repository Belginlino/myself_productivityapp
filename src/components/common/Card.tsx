import React from 'react';
import { cn } from '../../utils/cn';

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
      className={cn(
        'glass-card rounded-3xl p-6 transition-all duration-300 ease-out',
        hoverEffect &&
          'hover:-translate-y-1 hover:border-black/20 dark:hover:border-white/25 dark:hover:shadow-[0_12px_40px_rgba(255,255,255,0.08)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
