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
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]';

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs gap-1.5',
    md: 'px-5 py-3 text-xs gap-2',
    lg: 'px-6 py-3.5 text-sm gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#C9F48A] text-[#1B2435] hover:bg-[#b1e06d] shadow-glow-accent',
    secondary:
      'bg-[#23324A] text-white hover:bg-[#2C3E5B] border border-white/10 shadow-md',
    outline:
      'border border-white/15 text-white hover:bg-white/10 backdrop-blur-sm',
    ghost:
      'text-[#A8B3C7] hover:text-white hover:bg-white/10',
    danger:
      'bg-[#FF5D73]/20 text-[#FF5D73] border border-[#FF5D73]/30 hover:bg-[#FF5D73]/30',
  };

  return (
    <button
      type={type}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
