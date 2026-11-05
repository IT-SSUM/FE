import { Button } from '@/components/common/Button/Button'
import { cn } from '@/utils/cn'
import { useEffect, useId, useRef } from 'react'

type DialogProps = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  className?: string
  confirmVariant?: 'primary' | 'secondary' | 'danger'
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
  confirmVariant = 'primary',
}: DialogProps) {
  const panel = useRef<HTMLElement>(null)
  const titleId = useId()
  const cancel = useRef(onCancel)
  useEffect(() => { cancel.current = onCancel }, [onCancel])
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const element = panel.current
    const buttons = () => Array.from(element?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]') ?? [])
    buttons()[0]?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); cancel.current?.() }
      if (event.key !== 'Tab') return
      const targets = buttons()
      const first = targets[0], last = targets.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', keydown)
    return () => { document.removeEventListener('keydown', keydown); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus() }
  }, [open])
  if (!open) {
    return null
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
    >
      <section
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'max-h-[90dvh] w-full max-w-[332px] overflow-y-auto rounded-control bg-white p-6 shadow-xl',
          className,
        )}
      >
        <h2 id={titleId} className="typography-title-1 text-neutral-900">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 typography-body-2 text-neutral-700">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2">
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmText}</Button>
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
        </div>
      </section>
    </div>
  )
}
