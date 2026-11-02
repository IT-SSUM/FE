import { useState, type FormEvent } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AddressSearchField } from '@/components/common/AddressSearchField/AddressSearchField'
import { Button } from '@/components/common/Button/Button'
import { DateField } from '@/components/common/DateField/DateField'
import { OptionCardGroup } from '@/components/common/OptionCardGroup/OptionCardGroup'
import { TimeField } from '@/components/common/TimeField/TimeField'
import { routePath } from '@/routes/paths'
import type { TradeAppointment } from './organizationTrades'

const methodOptions = ['직접 전달', '택배 전달'] as const

export function TradeAppointmentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { tradeId = 'trade-water-hyobi' } = useParams()
  const routeState = location.state as {
    appointment?: TradeAppointment
    quantity?: string
  } | null
  const saved = routeState?.appointment
  const [today] = useState(getLocalToday)
  const [date, setDate] = useState(saved?.date ?? today)
  const [time, setTime] = useState(saved?.time ?? '14:00')
  const [address, setAddress] = useState(
    saved?.address ?? '경기도 부천시 가마안로 12',
  )
  const [detailAddress, setDetailAddress] = useState(
    saved?.detailAddress ?? '센터 입구',
  )
  const [method, setMethod] = useState<(typeof methodOptions)[number]>(
    saved?.method === '택배 전달' ? '택배 전달' : '직접 전달',
  )
  const [dateError, setDateError] = useState('')
  const minimumDate = saved?.date && saved.date < today ? saved.date : today

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!date || date < minimumDate) {
      setDateError('오늘 이후 날짜를 선택해 주세요.')
      return
    }
    const appointment: TradeAppointment = {
      date,
      time,
      address,
      detailAddress,
      method,
    }
    navigate(routePath.organizationActiveTradeDetail(tradeId), {
      replace: true,
      state: { appointment, quantity: routeState?.quantity },
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
            min={minimumDate}
            max="2030-12-31"
            yearOrder="ascending"
            onChange={(value) => {
              setDate(value)
              setDateError('')
            }}
            labelClassName="text-xs font-bold leading-[18px]"
          />
          {dateError ? (
            <p className="mt-2 typography-label-2 text-error" role="alert">
              {dateError}
            </p>
          ) : null}

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

          <OptionCardGroup
            label="전달 방법"
            className="mt-6"
            columns={2}
            options={methodOptions}
            value={method}
            onChange={(value) =>
              setMethod(value as (typeof methodOptions)[number])
            }
          />
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

function getLocalToday() {
  return new Date().toLocaleDateString('sv-SE')
}
