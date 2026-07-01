import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export default function Field({ label, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <label className="text-sm text-gray-600 block mb-1">{label}</label>
      {children}
    </div>
  );
}
