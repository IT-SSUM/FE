import { cn } from '@/utils/cn'

export type SegmentedTabItem = {
  value: string
  label: string
}

type SegmentedTabsProps = {
  items: readonly SegmentedTabItem[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  className?: string
  itemClassName?: string
}

export function SegmentedTabs({
  items,
  value,
  onChange,
  ariaLabel,
  className,
  itemClassName,
}: SegmentedTabsProps) {
  return (
    <div
      className={cn('flex gap-2 overflow-x-auto', className)}
      role="tablist"
      aria-label={ariaLabel}
      onWheel={(event) => {
        const tabs = event.currentTarget
        if (tabs.scrollWidth <= tabs.clientWidth) return
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

        event.preventDefault()
        tabs.scrollLeft += event.deltaY
      }}
    >
      {items.map((item) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              'h-9 shrink-0 rounded-pill border px-4 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700',
              selected
                ? 'border-primary-700 bg-primary-700 text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary-300',
              itemClassName,
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
