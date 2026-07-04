import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md';
  active?: boolean;
  hoverable?: boolean;
}

const PADDING_CLASSES: Record<NonNullable<CardProps['padding']>, string> = {
  sm: 'p-5',
  md: 'p-6',
};

export default function Card({
  padding = 'md',
  active = true,
  hoverable = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  const activeClasses = active ? 'border-gray-200' : 'border-gray-100 opacity-50';
  const hoverClasses = hoverable
    ? 'hover:border-blue-300 hover:shadow-md transition-all group'
    : '';

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm ${activeClasses} ${hoverClasses} ${PADDING_CLASSES[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
