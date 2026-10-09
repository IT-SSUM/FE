import { cn } from '@/utils/cn'

export type BadgeVariant = 'waiting' | 'progress' | 'complete'

type BadgeProps = {
  variant?: BadgeVariant
  children?: string
  className?: string
}

const badgeConfig: Record<BadgeVariant, { label: string; className: string }> = {
  waiting: {
    label: '매칭 대기',
    className: 'bg-neutral-100 text-neutral-700',
  },
  progress: {
    label: '진행 중',
    className: 'bg-primary-100 text-primary-700',
  },
  complete: {
    label: '기부 완료',
    className: 'bg-success-bg text-success',
  },
}

export function Badge({ variant = 'waiting', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-pill px-3 typography-label-2',
        badgeConfig[variant].className,
        className,
      )}
    >
      {children ?? badgeConfig[variant].label}
    </span>
  )
}
