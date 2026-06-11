import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950',
  secondary: 'border border-slate-300 text-slate-600 hover:bg-slate-50',
  danger: 'text-red-600 hover:bg-red-50',
  ghost: 'text-slate-500 hover:text-slate-700',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={`rounded-md transition-colors disabled:opacity-40 ${variantClass[variant]} ${className}`}
    />
  )
}
