import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'none';
  loading?: boolean;
  loadingText?: ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50',
  ghost: 'text-gray-500 disabled:opacity-50',
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  none: 'text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`rounded-lg font-medium transition-colors ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {loading ? (loadingText ?? 'Carregando...') : children}
    </button>
  );
}
