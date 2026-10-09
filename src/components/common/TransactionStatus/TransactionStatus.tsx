import { cn } from '@/utils/cn'

export type TransactionStatusVariant =
  | 'trading'
  | 'reserved'
  | 'complete'
  | 'request'

type TransactionStatusProps = {
  variant?: TransactionStatusVariant
  children?: string
  className?: string
}

const statusConfig: Record<
  TransactionStatusVariant,
  { label: string; className: string }
> = {
  trading: {
    label: '거래중',
    className: 'bg-neutral-100 text-neutral-700',
  },
  reserved: {
    label: '예약중',
    className: 'bg-primary-100 text-primary-700',
  },
  complete: {
    label: '전달 완료',
    className: 'bg-success-bg text-success',
  },
  request: {
    label: '기관 요청',
    className: 'bg-warning-bg text-warning',
  },
}

export function TransactionStatus({
  variant = 'trading',
  children,
  className,
}: TransactionStatusProps) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-pill px-3 typography-label-2',
        statusConfig[variant].className,
        className,
      )}
    >
      {children ?? statusConfig[variant].label}
    </span>
  )
}
