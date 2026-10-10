import { useEffect, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useViewportPopover } from '@/hooks/useViewportPopover'

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
    <div ref={containerRef} className="date-field">
      <label id={`${id}-label`} className="auth-field-label">{label}</label>
      <button
        id={id}
        type="button"
        className="date-trigger"
        aria-labelledby={`${id}-label ${id}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <CalendarDays aria-hidden size={18} />
        <span className={value ? '' : 'date-placeholder'}>{formatDisplayDate(value)}</span>
      </button>

      {open ? (
        <section
          className="calendar-popover"
          style={popoverStyle}
          role="dialog"
          aria-modal="false"
          aria-label={`${label} 날짜 선택`}
        >
          <div className="calendar-header">
            <div className="calendar-selects">
              <select
                aria-label="연도 선택"
                value={viewDate.getFullYear()}
                onChange={(event) => setViewDate(new Date(Number(event.target.value), viewDate.getMonth(), 1))}
              >
                {years.map((year) => <option key={year} value={year}>{year}년</option>)}
              </select>
              <select
                aria-label="월 선택"
                value={viewDate.getMonth()}
                onChange={(event) => setViewDate(new Date(viewDate.getFullYear(), Number(event.target.value), 1))}
              >
                {Array.from({ length: 12 }, (_, month) => (
                  <option key={month} value={month}>{month + 1}월</option>
                ))}
              </select>
            </div>
            <div className="calendar-navigation">
              <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">
                <ChevronLeft aria-hidden size={19} />
              </button>
              <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달">
                <ChevronRight aria-hidden size={19} />
              </button>
            </div>
          </div>

          <div className="calendar-weekdays" aria-hidden>
            {weekDays.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="calendar-grid">
            {calendarDays.map((date) => {
              const currentMonth = date.getMonth() === viewDate.getMonth()
              const selected = Boolean(selectedDate && isSameDay(date, selectedDate))
              const currentDay = isSameDay(date, today)
              const disabled = isDisabled(date)

              return (
                <button
                  key={formatDate(date)}
                  type="button"
                  className={[
                    'calendar-day',
                    currentMonth ? '' : 'calendar-day--outside',
                    selected ? 'calendar-day--selected' : '',
                    currentDay ? 'calendar-day--today' : '',
                  ].filter(Boolean).join(' ')}
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

          <div className="calendar-footer">
            <button type="button" onClick={() => { onChange(''); setOpen(false) }}>초기화</button>
            <button type="button" onClick={chooseToday} disabled={isDisabled(today)}>오늘</button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
