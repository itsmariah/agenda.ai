import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  align?: 'center' | 'start';
  className?: string;
}

export default function PageHeader({ title, subtitle, action, align = 'center', className = '' }: PageHeaderProps) {
  const alignClass = align === 'start' ? 'items-start' : 'items-center';

  return (
    <div className={`flex ${alignClass} justify-between mb-6 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
