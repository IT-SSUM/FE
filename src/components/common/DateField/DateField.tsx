import { useEffect, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useViewportPopover } from '@/hooks/useViewportPopover'
import { cn } from '@/utils/cn'

type DateFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
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

export function DateField({ id, label, value, onChange, min, max }: DateFieldProps) {
  const selectedDate = parseDate(value)
  const minDate = parseDate(min)
  const maxDate = parseDate(max)
  const [today] = useState(() => new Date())
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(selectedDate ?? today)
  const { anchorRef: containerRef, popoverStyle } = useViewportPopover<HTMLDivElement>(open, 390)
  const calendarDays = buildCalendarDays(viewDate)
  const minimumYear = minDate?.getFullYear() ?? 1900
  const maximumYear = maxDate?.getFullYear() ?? today.getFullYear() + 10
  const years = Array.from(
    { length: maximumYear - minimumYear + 1 },
    (_, index) => maximumYear - index,
  )

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
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
  }

  const chooseToday = () => {
    if (isDisabled(today)) return
    chooseDate(today)
  }

  return (
    <div ref={containerRef} className="relative">
      <label id={`${id}-label`} className="mb-2 block text-sm font-medium leading-5 text-neutral-900">{label}</label>
      <button
        id={id}
        type="button"
        className="flex h-[52px] w-full items-center gap-3 rounded-input border border-neutral-500 bg-white px-4 text-left text-sm text-neutral-900 transition-shadow hover:border-primary-700 focus-visible:border-primary-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-700/10 [&>svg]:shrink-0 [&>svg]:text-primary-700"
        aria-labelledby={`${id}-label ${id}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <select
                className="h-9 rounded-[10px] border-0 bg-neutral-100 px-2 text-[13px] font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-primary-700/15"
                aria-label="연도 선택"
                value={viewDate.getFullYear()}
                onChange={(event) => setViewDate(new Date(Number(event.target.value), viewDate.getMonth(), 1))}
              >
                {years.map((year) => <option key={year} value={year}>{year}년</option>)}
              </select>
              <select
                className="h-9 rounded-[10px] border-0 bg-neutral-100 px-2 text-[13px] font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-primary-700/15"
                aria-label="월 선택"
                value={viewDate.getMonth()}
                onChange={(event) => setViewDate(new Date(viewDate.getFullYear(), Number(event.target.value), 1))}
              >
                {Array.from({ length: 12 }, (_, month) => (
                  <option key={month} value={month}>{month + 1}월</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-0.5">
              <button className="inline-flex size-9 items-center justify-center rounded-[10px] border-0 bg-transparent text-neutral-800 hover:bg-primary-100 hover:text-primary-700" type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">
                <ChevronLeft aria-hidden size={19} />
              </button>
              <button className="inline-flex size-9 items-center justify-center rounded-[10px] border-0 bg-transparent text-neutral-800 hover:bg-primary-100 hover:text-primary-700" type="button" onClick={() => moveMonth(1)} aria-label="다음 달">
                <ChevronRight aria-hidden size={19} />
              </button>
            </div>
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
            <button type="button" onClick={() => { onChange(''); setOpen(false) }}>초기화</button>
            <button type="button" onClick={chooseToday} disabled={isDisabled(today)}>오늘</button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
