import { Button } from '@/components/common/Button/Button'
import { cn } from '@/utils/cn'

type BottomSheetProps = {
  open: boolean
  title: string
  primaryText?: string
  secondaryText?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
  className?: string
}

export function BottomSheet({
  open,
  title,
  primaryText = '확인',
  secondaryText = '닫기',
  onPrimaryClick,
  onSecondaryClick,
  className,
}: BottomSheetProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-5 pb-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
        className={cn(
          'w-full max-w-[332px] rounded-control bg-white p-6 shadow-xl',
          className,
        )}
      >
        <h2
          id="bottom-sheet-title"
          className="typography-title-1 text-neutral-900"
        >
          {title}
        </h2>
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={onPrimaryClick}>{primaryText}</Button>
          <Button variant="secondary" onClick={onSecondaryClick}>
            {secondaryText}
          </Button>
        </div>
      </section>
    </div>
  )
}
