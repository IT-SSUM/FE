import { forwardRef, type TextareaHTMLAttributes, useId } from 'react'
import { cn } from '@/utils/cn'

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  id?: string
  label: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ id, label, error, required, disabled, className, maxLength, ...props }, ref) => {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const messageId = error ? `${textareaId}-error` : undefined

    return (
      <div className="flex w-full flex-col gap-2">
        <label
          htmlFor={textareaId}
          className="typography-label-1 text-neutral-900"
        >
          {label}
          {required ? <span className="text-error"> *</span> : null}
        </label>
        <textarea
          id={textareaId}
          ref={ref}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          className={cn(
            'min-h-[128px] w-full resize-y rounded-input border bg-white px-4 py-3 typography-body-2 text-neutral-900 outline-none transition-colors',
            'placeholder:text-neutral-500 focus:border-primary-700',
            'disabled:bg-neutral-100 disabled:text-neutral-700 disabled:placeholder:text-neutral-500',
            error ? 'border-error focus:border-error' : 'border-neutral-500',
            className,
          )}
          {...props}
        />
        <div className="flex items-start justify-between gap-3">
          {error ? (
            <p id={messageId} className="typography-label-2 text-error">
              {error}
            </p>
          ) : (
            <span />
          )}
          {maxLength ? (
            <span className="typography-label-2 text-neutral-500">
              최대 {maxLength}자
            </span>
          ) : null}
        </div>
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
