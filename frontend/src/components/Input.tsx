import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const baseClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 ' +
  'placeholder:text-slate-400 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100'

function cx(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(baseClass, className)} />
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(baseClass, className)} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(baseClass, className)} />
}
