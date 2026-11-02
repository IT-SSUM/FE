import { useState, type FormEvent } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AddressSearchField } from '@/components/common/AddressSearchField/AddressSearchField'
import { Button } from '@/components/common/Button/Button'
import { DateField } from '@/components/common/DateField/DateField'
import { TimeField } from '@/components/common/TimeField/TimeField'
import { routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'
import type { TradeAppointment } from './organizationTrades'

const methodOptions = ['직접 전달', '택배 전달'] as const

export function TradeAppointmentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { tradeId = 'trade-water-hyobi' } = useParams()
  const saved = (location.state as { appointment?: TradeAppointment } | null)
    ?.appointment
  const [date, setDate] = useState('2026-10-09')
  const [time, setTime] = useState('14:00')
  const [address, setAddress] = useState(
    saved?.location.split(',')[0]?.trim() ?? '경기도 부천시 가마안로 12',
  )
  const [detailAddress, setDetailAddress] = useState(
    saved?.location.split(',').slice(1).join(',').trim() ?? '센터 입구',
  )
  const [method, setMethod] = useState<(typeof methodOptions)[number]>(
    saved?.method === '택배 전달' ? '택배 전달' : '직접 전달',
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const appointment: TradeAppointment = {
      dateTime: `${formatKoreanDate(date)} ${formatKoreanTime(time)}`,
      location: detailAddress ? `${address}, ${detailAddress}` : address,
      method,
    }
    navigate(routePath.organizationActiveTradeDetail(tradeId), {
      replace: true,
      state: { appointment },
    })
  }

  return (
    <form
      className="flex min-h-dvh flex-col bg-surface-canvas"
      onSubmit={handleSubmit}
    >
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">전달 약속 입력</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <div>
          <DateField
            id="appointment-date"
            label="날짜"
            value={date}
            min="2026-01-01"
            max="2030-12-31"
            yearOrder="ascending"
            onChange={setDate}
            labelClassName="text-xs font-bold leading-[18px]"
          />

          <div className="mt-6">
            <TimeField
              id="appointment-time"
              label="시간"
              value={time}
              onChange={setTime}
              labelClassName="text-xs font-bold leading-[18px]"
            />
          </div>

          <div className="mt-6">
            <AddressSearchField
              id="appointment-address"
              label="전달 장소"
              address={address}
              detailAddress={detailAddress}
              onAddressChange={setAddress}
              onDetailAddressChange={setDetailAddress}
              labelClassName="text-xs font-bold leading-[18px]"
            />
          </div>

          <fieldset className="mt-6">
            <legend className="text-xs font-bold leading-[18px] text-neutral-900">
              전달 방법
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {methodOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={method === option}
                  onClick={() => setMethod(option)}
                  className={cn(
                    'h-[52px] rounded-input border text-sm font-medium transition-colors',
                    method === option
                      ? 'border-primary-400 bg-primary-100 font-semibold text-primary-700'
                      : 'border-neutral-300 bg-white text-neutral-700',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <p className="mt-4 text-xs font-normal leading-5 text-neutral-700">
          세 항목을 모두 입력하면 저장할 수 있어요.
          <br />
          저장하면 상대방과 채팅에 약속이 공유돼요.
        </p>
      </main>

      <footer className="shrink-0 px-5 pb-4 pt-2">
        <Button type="submit" className="h-[46px] w-full">
          약속 저장
        </Button>
      </footer>
    </form>
  )
}

function formatKoreanDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return '날짜 미정'
  const date = new Date(year, month - 1, day)
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  return `${year}년 ${month}월 ${day}일 (${weekdays[date.getDay()]})`
}

function formatKoreanTime(value: string) {
  const [hourValue, minuteValue = '00'] = value.split(':')
  const hour24 = Number(hourValue) || 0
  const meridiem = hour24 < 12 ? '오전' : '오후'
  const hour = hour24 % 12 || 12
  const minute = Number(minuteValue)
  return `${meridiem} ${hour}시${minute ? ` ${minute}분` : ''}`
}
