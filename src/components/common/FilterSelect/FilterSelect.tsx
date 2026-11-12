import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

import {
  Check,
  ChevronDown,
} from 'lucide-react'

import {
  createPortal,
} from 'react-dom'

import {
  cn,
} from '@/utils/cn'

type FilterSelectProps = {
  label: string

  value: string

  options:
    readonly string[]

  onChange: (
    value: string,
  ) => void

  className?: string

  showMenuLabel?: boolean

  showChevron?: boolean

  disabled?: boolean

  includeAllOption?: boolean
}

const MENU_WIDTH =
  208

const VIEWPORT_GAP =
  12

const MENU_GAP =
  8

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  className,
  showMenuLabel = true,
  showChevron = true,
  disabled = false,
  includeAllOption = true,
}: FilterSelectProps) {
  const [
    open,
    setOpen,
  ] = useState(false)

  const [
    menuStyle,
    setMenuStyle,
  ] =
    useState<CSSProperties>(
      {},
    )

  const buttonRef =
    useRef<HTMLButtonElement>(
      null,
    )

  const menuRef =
    useRef<HTMLDivElement>(
      null,
    )

  const menuId =
    useId()

  useEffect(() => {
    if (!open) {
      return
    }

    const updatePosition =
      () => {
        const button =
          buttonRef.current

        if (!button) {
          return
        }

        const rect =
          button.getBoundingClientRect()

        const boundary =
          button.closest<HTMLElement>(
            '[data-filter-boundary]',
          )

        const boundaryRect =
          boundary?.getBoundingClientRect()

        const boundaryLeft =
          Math.max(
            boundaryRect?.left ??
              0,
            0,
          )

        const boundaryRight =
          Math.min(
            boundaryRect?.right ??
              window.innerWidth,
            window.innerWidth,
          )

        const width =
          Math.min(
            MENU_WIDTH,
            boundaryRight -
              boundaryLeft -
              VIEWPORT_GAP *
                2,
          )

        const left =
          Math.min(
            Math.max(
              rect.left,
              boundaryLeft +
                VIEWPORT_GAP,
            ),
            boundaryRight -
              width -
              VIEWPORT_GAP,
          )

        const estimatedHeight =
          Math.min(
            (options.length +
              1) *
              44 +
              (showMenuLabel
                ? 58
                : 16),
            280,
          )

        const placeAbove =
          window.innerHeight -
            rect.bottom <
            estimatedHeight +
              MENU_GAP &&
          rect.top >
            window.innerHeight -
              rect.bottom

        setMenuStyle({
          left,
          width,

          ...(placeAbove
            ? {
                bottom:
                  window.innerHeight -
                  rect.top +
                  MENU_GAP,
              }
            : {
                top:
                  rect.bottom +
                  MENU_GAP,
              }),
        })
      }

    const closeOnOutsideClick =
      (
        event:
          PointerEvent,
      ) => {
        const target =
          event.target as Node

        if (
          !buttonRef.current?.contains(
            target,
          ) &&
          !menuRef.current?.contains(
            target,
          )
        ) {
          setOpen(false)
        }
      }

    const closeOnEscape =
      (
        event:
          KeyboardEvent,
      ) => {
        if (
          event.key !==
          'Escape'
        ) {
          return
        }

        setOpen(false)

        buttonRef.current?.focus()
      }

    updatePosition()

    document.addEventListener(
      'pointerdown',
      closeOnOutsideClick,
    )

    document.addEventListener(
      'keydown',
      closeOnEscape,
    )

    window.addEventListener(
      'resize',
      updatePosition,
    )

    window.addEventListener(
      'scroll',
      updatePosition,
      true,
    )

    return () => {
      document.removeEventListener(
        'pointerdown',
        closeOnOutsideClick,
      )

      document.removeEventListener(
        'keydown',
        closeOnEscape,
      )

      window.removeEventListener(
        'resize',
        updatePosition,
      )

      window.removeEventListener(
        'scroll',
        updatePosition,
        true,
      )
    }
  }, [
    open,
    options.length,
    showMenuLabel,
  ])

  const selectValue =
    (
      nextValue:
        string,
    ) => {
      onChange(
        nextValue,
      )

      setOpen(false)

      buttonRef.current?.focus()
    }

  const menu =
    open ? (
      <div
        ref={menuRef}
        id={menuId}
        role="listbox"
        aria-label={`${label} 선택`}
        style={menuStyle}
        className="fixed z-50 overflow-hidden rounded-[18px] border border-neutral-200 bg-white p-2 shadow-[0_16px_40px_rgb(18_61_49/18%)]"
      >
        {showMenuLabel ? (
          <p className="px-3 pb-2 pt-1 typography-label-1 text-neutral-900">
            {label} 선택
          </p>
        ) : null}

        <div className="max-h-56 space-y-1 overflow-y-auto">
          {[
            ...(includeAllOption ? [''] : []),
            ...options,
          ].map(
            (option) => {
              const selected =
                option ===
                value

              const optionLabel =
                option ||
                `${label} 전체`

              return (
                <button
                  key={
                    optionLabel
                  }
                  type="button"
                  role="option"
                  aria-selected={
                    selected
                  }
                  className={cn(
                    'flex h-10 w-full items-center justify-between rounded-xl px-3 text-left typography-body-2 text-neutral-800 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-primary-700',

                    selected &&
                      'bg-primary-100 font-semibold text-primary-700',
                  )}
                  onClick={() =>
                    selectValue(
                      option,
                    )
                  }
                >
                  <span>
                    {
                      optionLabel
                    }
                  </span>

                  {selected ? (
                    <Check
                      aria-hidden
                      size={17}
                      strokeWidth={
                        2.25
                      }
                    />
                  ) : null}
                </button>
              )
            },
          )}
        </div>
      </div>
    ) : null

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={
          open
        }
        aria-controls={
          open
            ? menuId
            : undefined
        }
        disabled={disabled}
        className={cn(
          'flex h-7 shrink-0 items-center gap-1 rounded-pill border px-3 typography-label-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700',

          value
            ? 'border-primary-300 bg-primary-100 text-primary-700'
            : 'border-neutral-200 bg-white text-neutral-700',

          className,
          'disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-700',
        )}
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
      >
        <span className="max-w-32 truncate">
          {value ||
            label}
        </span>

        {showChevron ? (
          <ChevronDown
            aria-hidden
            size={14}
            strokeWidth={2}
            className={cn(
              'transition-transform',

              open &&
                'rotate-180',
            )}
          />
        ) : null}
      </button>

      {menu
        ? createPortal(
            menu,
            document.body,
          )
        : null}
    </>
  )
}
