import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
  }
>

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-800 disabled:bg-neutral-200 disabled:text-neutral-700',
  secondary:
    'border border-neutral-200 bg-white text-primary-700 hover:bg-primary-100 active:bg-primary-100 disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500',
  danger:
    'bg-error text-white hover:bg-[#9F332E] active:bg-[#9F332E] disabled:bg-neutral-200 disabled:text-neutral-700',
}

export function Button({
  variant = 'primary',
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-[52px] items-center justify-center rounded-control px-5 typography-title-3 transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700',
        'disabled:cursor-not-allowed',
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
