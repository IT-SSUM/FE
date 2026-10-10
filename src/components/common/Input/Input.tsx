import { forwardRef, type InputHTMLAttributes, useId } from 'react'
import { cn } from '@/utils/cn'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id?: string
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, required, disabled, className, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const messageId = error ? `${inputId}-error` : undefined

    return (
      <div className="flex w-full flex-col gap-2">
        <label htmlFor={inputId} className="typography-label-1 text-neutral-900">
          {label}
          {required ? <span className="text-error"> *</span> : null}
        </label>
        <input
          id={inputId}
          ref={ref}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          className={cn(
            'h-[54px] w-full rounded-input border bg-white px-4 typography-body-1 text-neutral-900 outline-none transition-colors',
            'placeholder:text-neutral-500 focus:border-primary-700',
            'disabled:bg-neutral-100 disabled:text-neutral-700 disabled:placeholder:text-neutral-500',
            error ? 'border-error focus:border-error' : 'border-neutral-500',
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={messageId} className="typography-label-2 text-error">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
