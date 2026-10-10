import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/utils/cn'

type GuidanceCardProps = {
  icon?: ReactNode
  title: string
  description?: string
  className?: string
}

export function GuidanceCard({
  icon,
  title,
  description,
  className,
}: GuidanceCardProps) {
  return (
    <section
      className={cn(
        'flex w-full gap-3 rounded-card border border-primary-700 bg-primary-100 p-4',
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-primary-700">
        {icon ?? <Info aria-hidden size={18} />}
      </span>
      <div>
        <h3 className="typography-title-3 text-primary-700">{title}</h3>
        {description ? (
          <p className="mt-1 typography-body-2 text-neutral-700">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  )
}
