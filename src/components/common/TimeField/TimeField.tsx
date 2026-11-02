import { useEffect, useRef, useState, type Ref } from 'react'
import { Check, ChevronDown, Clock3 } from 'lucide-react'
import { cn } from '@/utils/cn'

type TimeFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  labelClassName?: string
}

const meridiems = ['오전', '오후'] as const
const hours = Array.from({ length: 12 }, (_, index) => index + 1)
const minutes = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, '0'),
)
const itemHeight = 44

function parseTime(value: string) {
  const [hourValue, minuteValue = '00'] = value.split(':')
  const parsedHour = Number(hourValue)
  const hour24 =
    hourValue !== '' && Number.isFinite(parsedHour) && parsedHour >= 0 && parsedHour < 24
      ? parsedHour
      : 14
  return {
    meridiem: hour24 < 12 ? '오전' : '오후',
    hour: hour24 % 12 || 12,
    minute: minutes.includes(minuteValue) ? minuteValue : '00',
  } as const
}

function toValue(meridiem: string, hour: number, minute: string) {
  const hour24 = meridiem === '오전' ? hour % 12 : (hour % 12) + 12
  return `${String(hour24).padStart(2, '0')}:${minute}`
}

function displayTime(value: string) {
  const parsed = parseTime(value)
  return `${parsed.meridiem} ${parsed.hour}시${parsed.minute === '00' ? '' : ` ${Number(parsed.minute)}분`}`
}

export function TimeField({
  id,
  label,
  value,
  onChange,
  labelClassName,
}: TimeFieldProps) {
  const parsed = parseTime(value)
  const [open, setOpen] = useState(false)
  const [meridiem, setMeridiem] = useState(parsed.meridiem)
  const [hour, setHour] = useState(parsed.hour)
  const [minute, setMinute] = useState(parsed.minute)
  const meridiemRef = useRef<HTMLDivElement>(null)
  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const next = parseTime(value)
    const frame = window.requestAnimationFrame(() => {
      meridiemRef.current?.scrollTo({
        top: meridiems.indexOf(next.meridiem) * itemHeight,
      })
      hourRef.current?.scrollTo({
        top: hours.indexOf(next.hour) * itemHeight,
      })
      minuteRef.current?.scrollTo({
        top: minutes.indexOf(next.minute) * itemHeight,
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, value])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <div className="relative">
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
        aria-labelledby={`${id}-label ${id}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setOpen(false)
            return
          }
          const next = parseTime(value)
          setMeridiem(next.meridiem)
          setHour(next.hour)
          setMinute(next.minute)
          setOpen(true)
        }}
        className="flex h-[52px] w-full items-center gap-3 rounded-input border border-neutral-500 bg-white px-4 text-left text-sm text-neutral-900 hover:border-primary-700"
      >
        <Clock3 aria-hidden size={18} className="text-primary-700" />
        <span className="flex-1">{displayTime(value)}</span>
        <ChevronDown aria-hidden size={17} className="text-neutral-600" />
      </button>

      {open ? (
        <section
          role="dialog"
          aria-label="시간 선택"
          className="absolute left-0 right-0 top-[82px] z-20 rounded-control border border-neutral-200 bg-white p-4 shadow-xl"
        >
          <div className="mb-2 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-neutral-600">
            <span>오전·오후</span>
            <span>시</span>
            <span>분</span>
          </div>
          <div className="relative grid grid-cols-3 gap-2 overflow-hidden rounded-input bg-neutral-100 p-1">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-1 top-[48px] h-11 rounded-[10px] border border-primary-300 bg-white"
            />
            <WheelColumn
              ref={meridiemRef}
              options={meridiems}
              selected={meridiem}
              onChange={setMeridiem}
            />
            <WheelColumn
              ref={hourRef}
              options={hours}
              selected={hour}
              onChange={setHour}
            />
            <WheelColumn
              ref={minuteRef}
              options={minutes}
              selected={minute}
              onChange={setMinute}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              onChange(toValue(meridiem, hour, minute))
              setOpen(false)
            }}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-control bg-primary-700 text-xs font-semibold text-white"
          >
            <Check aria-hidden size={16} />
            시간 적용
          </button>
        </section>
      ) : null}
    </div>
  )
}

type WheelValue = string | number

type WheelColumnProps<T extends WheelValue> = {
  options: readonly T[]
  selected: T
  onChange: (value: T) => void
  ref: Ref<HTMLDivElement>
}

function WheelColumn<T extends WheelValue>({
  options,
  selected,
  onChange,
  ref,
}: WheelColumnProps<T>) {
  return (
    <div
      ref={ref}
      className="relative z-10 h-[132px] snap-y snap-mandatory overflow-y-auto py-11 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onScroll={(event) => {
        const index = Math.max(
          0,
          Math.min(
            options.length - 1,
            Math.round(event.currentTarget.scrollTop / itemHeight),
          ),
        )
        onChange(options[index])
      }}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={(event) => {
            onChange(option)
            event.currentTarget.parentElement?.scrollTo({
              top: options.indexOf(option) * itemHeight,
              behavior: 'smooth',
            })
          }}
          className={cn(
            'flex h-11 w-full snap-center items-center justify-center rounded-[10px] text-sm transition-colors',
            selected === option
              ? 'font-bold text-primary-700'
              : 'text-neutral-500',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
