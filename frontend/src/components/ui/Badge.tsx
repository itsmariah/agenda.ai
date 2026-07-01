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

export default function Badge({ tone, className = '', onClick, children, ...rest }: BadgeProps) {
  const classes = `text-xs font-medium px-3 py-1 rounded-full ${BADGE_TONE_CLASSES[tone]} ${className}`;

  if (onClick) {
    return (
      <button onClick={onClick} className={classes} {...rest}>
        {children}
      </button>
    );
  }

  return <span className={classes}>{children}</span>;
}
