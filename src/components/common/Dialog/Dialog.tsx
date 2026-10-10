import { Button } from '@/components/common/Button/Button'
import { cn } from '@/utils/cn'

type DialogProps = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  className?: string
}

export function Dialog({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  className,
}: DialogProps) {
  if (!open) {
    return null
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={cn(
          'w-full max-w-[332px] rounded-control bg-white p-6 shadow-xl',
          className,
        )}
      >
        <h2 id="dialog-title" className="typography-title-1 text-neutral-900">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 typography-body-2 text-neutral-700">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={onConfirm}>{confirmText}</Button>
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
        </div>
      </section>
    </div>
  )
}
