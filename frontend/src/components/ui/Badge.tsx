import type { ButtonHTMLAttributes } from 'react';

export type BadgeTone = 'green' | 'gray' | 'yellow' | 'blue' | 'red';

interface BadgeProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone: BadgeTone;
}

export const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-green-100 text-green-700',
  gray: 'bg-gray-100 text-gray-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
};

const BADGE_HOVER_CLASSES: Record<BadgeTone, string> = {
  green: 'hover:bg-green-200',
  gray: 'hover:bg-gray-200',
  yellow: 'hover:bg-yellow-200',
  blue: 'hover:bg-blue-200',
  red: 'hover:bg-red-200',
};

export default function Badge({ tone, className = '', onClick, children, ...rest }: BadgeProps) {
  const classes = `text-xs font-medium px-3 py-1 rounded-full ${BADGE_TONE_CLASSES[tone]} ${className}`;

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${classes} transition-colors ${BADGE_HOVER_CLASSES[tone]}`}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return <span className={classes}>{children}</span>;
}
