import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

type ProfileMenuProps = {
  icon?: ReactNode
  title: string
  onClick?: () => void
  className?: string
}

export function ProfileMenu({
  icon,
  title,
  onClick,
  className,
}: ProfileMenuProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-[60px] w-full items-center gap-3 rounded-input border border-primary-700 bg-white px-4 text-left',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700',
        'transition-colors hover:bg-primary-100',
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        {icon}
      </span>
      <span className="flex-1 typography-title-3 text-neutral-900">{title}</span>
      <ChevronRight aria-hidden size={20} className="text-neutral-500" />
    </button>
  )
}
