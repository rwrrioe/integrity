import { ReactNode } from 'react';

interface AuthButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export function AuthButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = true,
}: AuthButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg transition-colors';
  const variantClasses =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-slate-200 text-slate-700 hover:bg-slate-300';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${widthClasses}`}
    >
      {children}
    </button>
  );
}
