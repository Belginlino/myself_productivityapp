import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 ease-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]';

  const sizeStyles = {
    sm: 'px-4 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-xs gap-2',
    lg: 'px-7 py-3.5 text-sm gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.35)]',
    secondary:
      'bg-white/10 text-white hover:bg-white/20 border border-white/15 backdrop-blur-md hover:border-white/30',
    outline:
      'border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 backdrop-blur-sm',
    ghost:
      'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10',
    danger:
      'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
