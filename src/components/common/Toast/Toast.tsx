import { AlertTriangle, Check, Info } from 'lucide-react'
import { cn } from '@/utils/cn'

type ToastVariant = 'success' | 'info' | 'error'

type ToastProps = {
  variant?: ToastVariant
  title: string
  description?: string
  className?: string
}

const toastConfig = {
  success: {
    icon: Check,
    className: 'bg-primary-100 text-success',
  },
  info: {
    icon: Info,
    className: 'bg-neutral-100 text-neutral-700',
  },
  error: {
    icon: AlertTriangle,
    className: 'bg-error-bg text-error',
  },
} as const

export function Toast({
  variant = 'success',
  title,
  description,
  className,
}: ToastProps) {
  const Icon = toastConfig[variant].icon

  return (
    <section
      role="status"
      className={cn(
        'flex min-h-[86px] w-full max-w-[440px] items-start gap-3 rounded-control px-5 py-4 shadow-sm',
        toastConfig[variant].className,
        className,
      )}
    >
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/80">
        <Icon aria-hidden size={16} strokeWidth={2.5} />
      </span>
      <div>
        <h2 className="typography-title-3">{title}</h2>
        {description ? (
          <p className="mt-1 typography-body-2 text-neutral-700">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  )
}
