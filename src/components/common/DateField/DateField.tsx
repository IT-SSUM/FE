import { useEffect, useState } from 'react'
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useViewportPopover } from '@/hooks/useViewportPopover'
import { cn } from '@/utils/cn'

type DateFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  labelClassName?: string
  yearOrder?: 'ascending' | 'descending'
}

const weekDays = ['일', '월', '화', '수', '목', '금', '토']

function parseDate(value?: string) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(value: string) {
  const date = parseDate(value)
  return date ? `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일` : '년 · 월 · 일'
}

function isSameDay(first: Date, second: Date) {
  return formatDate(first) === formatDate(second)
}

function buildCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const start = new Date(year, month, 1 - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

export function DateField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  labelClassName,
  yearOrder = 'descending',
}: DateFieldProps) {
  const selectedDate = parseDate(value)
  const minDate = parseDate(min)
  const maxDate = parseDate(max)
  const [today] = useState(() => new Date())
  const [open, setOpen] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState<'year' | 'month' | null>(null)
  const [viewDate, setViewDate] = useState(selectedDate ?? today)
  const { anchorRef: containerRef, popoverStyle } = useViewportPopover<HTMLDivElement>(open, 390)
  const calendarDays = buildCalendarDays(viewDate)
  const minimumYear = minDate?.getFullYear() ?? 1900
  const maximumYear = maxDate?.getFullYear() ?? today.getFullYear() + 10
  const years = Array.from(
    { length: maximumYear - minimumYear + 1 },
    (_, index) =>
      yearOrder === 'ascending' ? minimumYear + index : maximumYear - index,
  )

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setSelectorOpen(null)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setSelectorOpen(null)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, containerRef])

  const moveMonth = (amount: number) => {
    setViewDate((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + amount, 1)
      if (next.getFullYear() < minimumYear || next.getFullYear() > maximumYear) return current
      return next
    })
  }

  const isDisabled = (date: Date) =>
    Boolean((minDate && date < minDate) || (maxDate && date > maxDate))

  const chooseDate = (date: Date) => {
    if (isDisabled(date)) return
    onChange(formatDate(date))
    setViewDate(date)
    setOpen(false)
    setSelectorOpen(null)
  }

  const chooseToday = () => {
    if (isDisabled(today)) return
    chooseDate(today)
  }

  return (
    <div ref={containerRef} className="relative">
      <label
        id={`${id}-label`}
        className={cn(
          'mb-2 block text-neutral-900',
          labelClassName ?? 'text-sm font-medium leading-5',
        )}
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        className="flex h-[52px] w-full items-center gap-3 rounded-input border border-neutral-500 bg-white px-4 text-left text-sm text-neutral-900 transition-shadow hover:border-primary-700 focus-visible:border-primary-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-700/10 [&>svg]:shrink-0 [&>svg]:text-primary-700"
        aria-labelledby={`${id}-label ${id}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setOpen(false)
            setSelectorOpen(null)
          } else {
            setOpen(true)
          }
        }}
      >
        <CalendarDays aria-hidden size={18} />
        <span className={value ? '' : 'text-neutral-600'}>{formatDisplayDate(value)}</span>
      </button>

      {open ? (
        <section
          className="z-100 overflow-y-auto rounded-[18px] border border-neutral-300 bg-white p-3.5 shadow-[0_18px_42px_rgb(18_61_49/16%)]"
          style={popoverStyle}
          role="dialog"
          aria-modal="false"
          aria-label={`${label} 날짜 선택`}
        >
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={selectorOpen === 'year'}
                onClick={() => setSelectorOpen((current) => current === 'year' ? null : 'year')}
                className="flex h-9 items-center gap-1 rounded-[10px] bg-neutral-100 px-3 text-[13px] font-bold text-neutral-900 hover:bg-primary-100"
              >
                {viewDate.getFullYear()}년
                <ChevronDown aria-hidden size={15} />
              </button>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={selectorOpen === 'month'}
                onClick={() => setSelectorOpen((current) => current === 'month' ? null : 'month')}
                className="flex h-9 items-center gap-1 rounded-[10px] bg-neutral-100 px-3 text-[13px] font-bold text-neutral-900 hover:bg-primary-100"
              >
                {viewDate.getMonth() + 1}월
                <ChevronDown aria-hidden size={15} />
              </button>
            </div>
            <div className="flex items-center gap-0.5">
              <button className="inline-flex size-9 items-center justify-center rounded-[10px] border-0 bg-transparent text-neutral-800 hover:bg-primary-100 hover:text-primary-700" type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">
                <ChevronLeft aria-hidden size={19} />
              </button>
              <button className="inline-flex size-9 items-center justify-center rounded-[10px] border-0 bg-transparent text-neutral-800 hover:bg-primary-100 hover:text-primary-700" type="button" onClick={() => moveMonth(1)} aria-label="다음 달">
                <ChevronRight aria-hidden size={19} />
              </button>
            </div>

            {selectorOpen === 'year' ? (
              <div
                role="listbox"
                aria-label="연도 선택"
                className="absolute left-0 top-11 z-10 grid max-h-[224px] w-[132px] gap-1 overflow-y-auto rounded-control border border-neutral-200 bg-white p-2 shadow-xl"
              >
                {years.map((year) => {
                  const selected = year === viewDate.getFullYear()
                  return (
                    <button
                      key={year}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        setViewDate(new Date(year, viewDate.getMonth(), 1))
                        setSelectorOpen(null)
                      }}
                      className={cn(
                        'flex h-9 items-center justify-between rounded-[10px] px-3 text-xs',
                        selected
                          ? 'bg-primary-100 font-bold text-primary-700'
                          : 'text-neutral-800 hover:bg-neutral-100',
                      )}
                    >
                      {year}년
                      {selected ? <Check aria-hidden size={15} /> : null}
                    </button>
                  )
                })}
              </div>
            ) : null}

            {selectorOpen === 'month' ? (
              <div
                role="listbox"
                aria-label="월 선택"
                className="absolute left-[92px] top-11 z-10 grid w-[174px] grid-cols-3 gap-1.5 rounded-control border border-neutral-200 bg-white p-2 shadow-xl"
              >
                {Array.from({ length: 12 }, (_, month) => {
                  const selected = month === viewDate.getMonth()
                  return (
                    <button
                      key={month}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        setViewDate(new Date(viewDate.getFullYear(), month, 1))
                        setSelectorOpen(null)
                      }}
                      className={cn(
                        'h-9 rounded-[10px] text-xs',
                        selected
                          ? 'bg-primary-700 font-bold text-white'
                          : 'text-neutral-800 hover:bg-primary-100',
                      )}
                    >
                      {month + 1}월
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-7" aria-hidden>
            {weekDays.map((day) => <span className="py-[7px] text-center text-[11px] font-semibold text-neutral-600" key={day}>{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {calendarDays.map((date) => {
              const currentMonth = date.getMonth() === viewDate.getMonth()
              const selected = Boolean(selectedDate && isSameDay(date, selectedDate))
              const currentDay = isSameDay(date, today)
              const disabled = isDisabled(date)

              return (
                <button
                  key={formatDate(date)}
                  type="button"
                  className={cn(
                    'inline-flex aspect-square items-center justify-center rounded-[10px] border-0 bg-transparent text-xs text-neutral-900 transition-colors hover:bg-primary-100 hover:text-primary-700 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent',
                    !currentMonth && 'text-neutral-400',
                    currentDay && 'font-bold text-primary-700 shadow-[inset_0_0_0_1px_#76d6b7]',
                    selected && 'bg-primary-700 font-bold text-white shadow-none hover:bg-primary-700 hover:text-white',
                  )}
                  disabled={disabled}
                  aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}
                  aria-pressed={selected}
                  onClick={() => chooseDate(date)}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-neutral-200 pt-2.5 [&_button]:rounded-[10px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-2.5 [&_button]:py-[7px] [&_button]:text-xs [&_button]:font-semibold [&_button]:text-primary-700 [&_button]:hover:bg-primary-100 [&_button]:disabled:cursor-not-allowed [&_button]:disabled:text-neutral-400 [&_button]:disabled:hover:bg-transparent">
            <button type="button" onClick={() => { onChange(''); setOpen(false); setSelectorOpen(null) }}>초기화</button>
            <button type="button" onClick={chooseToday} disabled={isDisabled(today)}>오늘</button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
