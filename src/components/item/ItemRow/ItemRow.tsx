import type { MouseEventHandler, ReactNode } from 'react'
import { Package } from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/common/Badge/Badge'
import {
  TransactionStatus,
  type TransactionStatusVariant,
} from '@/components/common/TransactionStatus/TransactionStatus'
import { cn } from '@/utils/cn'

type ItemRowStatus =
  | BadgeVariant
  | TransactionStatusVariant
  | 'request'
  | 'reserved'

type ItemRowProps = {
  title: string
  description?: string
  quantity?: string | number
  imageSrc?: string
  icon?: ReactNode
  status?: ItemRowStatus
  statusType?: 'badge' | 'transaction'
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
}

const badgeStatusSet = new Set<ItemRowStatus>(['waiting', 'progress'])

export function ItemRow({
  title,
  description,
  quantity,
  imageSrc,
  icon,
  status = 'waiting',
  statusType,
  onClick,
  className,
}: ItemRowProps) {
  const useBadge = statusType
    ? statusType === 'badge'
    : badgeStatusSet.has(status)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left shadow-sm',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700',
        onClick ? 'cursor-pointer transition-colors hover:bg-neutral-100' : 'cursor-default',
        className,
      )}
    >
      <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-control bg-primary-100 text-primary-700">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          icon ?? <Package aria-hidden size={28} strokeWidth={2} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate typography-title-3 text-neutral-900">{title}</h3>
          {useBadge ? (
            <Badge variant={status as BadgeVariant} />
          ) : (
            <TransactionStatus variant={status as TransactionStatusVariant} />
          )}
        </div>
        {description ? (
          <p className="mt-1 line-clamp-2 typography-body-2 text-neutral-700">
            {description}
          </p>
        ) : null}
        {quantity ? (
          <p className="mt-2 typography-label-2 text-neutral-600">
            수량 {quantity}
          </p>
        ) : null}
      </div>
    </button>
  )
}
