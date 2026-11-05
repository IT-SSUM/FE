import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/utils/cn'

type OptionCardGroupProps = {
  label: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  columns?: 1 | 2
  hideLabel?: boolean
  className?: string
  labelClassName?: string
}

export function OptionCardGroup({
  label,
  options,
  value,
  onChange,
  columns = 1,
  hideLabel = false,
  className,
  labelClassName,
}: OptionCardGroupProps) {
  return (
    <fieldset className={cn('m-0 min-w-0 border-0 p-0', className)}>
      <legend
        className={cn(
          hideLabel
            ? 'sr-only'
            : 'text-xs font-bold leading-[18px] text-neutral-900',
          labelClassName,
        )}
      >
        {label}
      </legend>
      <div
        className={cn(
          hideLabel ? '' : 'mt-2',
          'grid gap-2',
          columns === 2 ? 'grid-cols-2' : 'grid-cols-1',
        )}
      >
        {options.map((option) => {
          const selected = option === value
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={cn(
                'flex min-h-[52px] w-full items-center gap-3 rounded-control border px-4 text-left typography-body-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700',
                selected
                  ? 'border-primary-300 bg-primary-100 font-semibold text-primary-700'
                  : 'border-neutral-200 bg-white text-neutral-900 hover:border-primary-300',
                columns === 2 && 'justify-center text-center',
              )}
            >
              {selected && columns === 1 ? (
                <CheckCircle2 aria-hidden size={20} strokeWidth={2} />
              ) : null}
              <span>{option}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
