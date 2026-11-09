import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

type SelectFieldProps = {
  id?: string
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
}

const VIEWPORT_GAP = 12
const MENU_GAP = 8
const MIN_MENU_WIDTH = 140
const MAX_MENU_HEIGHT = 272

export function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = '선택',
  disabled = false,
  error = false,
  className,
}: SelectFieldProps) {
  const generatedId = useId()
  const buttonId = id ?? generatedId
  const menuId = `${buttonId}-options`
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const button = buttonRef.current
      if (!button) return

      const rect = button.getBoundingClientRect()
      const width = Math.min(
        Math.max(rect.width, MIN_MENU_WIDTH),
        window.innerWidth - VIEWPORT_GAP * 2,
      )
      const left = Math.min(
        Math.max(rect.right - width, VIEWPORT_GAP),
        window.innerWidth - width - VIEWPORT_GAP,
      )
      const availableBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP - MENU_GAP
      const availableAbove = rect.top - VIEWPORT_GAP - MENU_GAP
      const placeBelow = availableBelow >= 180 || availableBelow >= availableAbove
      const maxHeight = Math.min(
        MAX_MENU_HEIGHT,
        Math.max(96, placeBelow ? availableBelow : availableAbove),
      )

      setMenuStyle({
        left,
        width,
        maxHeight,
        ...(placeBelow
          ? { top: rect.bottom + MENU_GAP, bottom: 'auto' }
          : { top: 'auto', bottom: window.innerHeight - rect.top + MENU_GAP }),
      })
    }

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }

    updatePosition()
    window.requestAnimationFrame(() => {
      const selected = menuRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
      selected?.focus()
    })
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  const selectValue = (nextValue: string) => {
    onChange(nextValue)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
    event.preventDefault()
    setOpen(true)
  }

  const menu = open ? (
    <div
      ref={menuRef}
      id={menuId}
      role="listbox"
      aria-label={`${label} 선택`}
      style={menuStyle}
      className="fixed z-100 overflow-y-auto rounded-[18px] border border-neutral-200 bg-white p-2 shadow-[0_16px_40px_rgb(18_61_49/18%)]"
    >
      {options.map((option) => {
        const selected = option === value
        return (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => selectValue(option)}
            className={cn(
              'flex h-10 w-full items-center justify-between gap-2 rounded-xl px-3 text-left typography-body-2 text-neutral-800 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-primary-700',
              selected && 'bg-primary-100 font-semibold text-primary-700',
            )}
          >
            <span>{option}</span>
            {selected ? <Check aria-hidden size={17} strokeWidth={2.25} /> : null}
          </button>
        )
      })}
    </div>
  ) : null

  return (
    <>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex h-[54px] min-w-0 items-center justify-between gap-2 rounded-input border bg-white px-3 typography-body-2 text-neutral-900 outline-none transition-colors',
          'hover:border-primary-700 focus-visible:border-primary-700 focus-visible:ring-3 focus-visible:ring-primary-700/10',
          'disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-500',
          error ? 'border-error' : 'border-neutral-500',
          open && 'border-primary-700 ring-3 ring-primary-700/10',
          className,
        )}
      >
        <span className={cn('truncate', !value && 'text-neutral-500')}>
          {value || placeholder}
        </span>
        <ChevronDown
          aria-hidden
          size={18}
          strokeWidth={2}
          className={cn('shrink-0 text-primary-700 transition-transform', open && 'rotate-180')}
        />
      </button>
      {menu ? createPortal(menu, document.body) : null}
    </>
  )
}
