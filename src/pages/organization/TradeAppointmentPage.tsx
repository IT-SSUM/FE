import { useRef, useState, type FormEvent } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AddressSearchField } from '@/components/common/AddressSearchField/AddressSearchField'
import { Button } from '@/components/common/Button/Button'
import { Input } from '@/components/common/Input/Input'
import { DateField } from '@/components/common/DateField/DateField'
import { OptionCardGroup } from '@/components/common/OptionCardGroup/OptionCardGroup'
import { TimeField } from '@/components/common/TimeField/TimeField'
import { routePath } from '@/routes/paths'
import { parseMatchId, matchErrorMessage } from '@/apis/match'
import { useMatchQuery } from '@/hooks/queries/useMatchQuery'
import { useUpdateMatchAppointmentMutation } from '@/hooks/mutations/useUpdateMatchAppointmentMutation'
import type { MatchDetail } from '@/types/match'

export function TradeAppointmentPage({ audience = 'ORGANIZATION' }: { audience?: 'DONOR' | 'ORGANIZATION' }) {
  const navigate = useNavigate()
  const { tradeId } = useParams()
  const id = parseMatchId(tradeId)
  const query = useMatchQuery(id)
  if (id === null || query.isPending || query.isError || !query.data) return <div className="min-h-dvh bg-surface-canvas p-5">
    <h1 className="typography-title-3">전달 약속 입력</h1>
    <p role={query.isError ? 'alert' : 'status'}>{id === null ? '올바른 매칭 번호가 필요해요.' : query.isError ? matchErrorMessage(query.error) : query.isPending ? '불러오는 중이에요.' : '거래 정보를 찾을 수 없어요.'}</p>
    {query.isError ? <Button onClick={() => void query.refetch()}>다시 시도</Button> : null}
    <Button variant="secondary" onClick={() => navigate(-1)}>뒤로가기</Button>
  </div>
  return <AppointmentForm key={query.data.matchId} item={query.data} audience={audience} />
}

function AppointmentForm({ item, audience }: { item: MatchDetail; audience: 'DONOR' | 'ORGANIZATION' }) {
  const navigate = useNavigate()
  const mutation = useUpdateMatchAppointmentMutation()
  const lock = useRef(false)
  const [initial] = useState(() => kstFields(item.scheduledAt))
  const [date, setDate] = useState(initial.date)
  const [time, setTime] = useState(initial.time)
  const [address, setAddress] = useState(item.deliveryPlace ?? '')
  const [detailAddress, setDetailAddress] = useState('')
  const [receiverName, setReceiverName] = useState(item.receiverName ?? '')
  const [method, setMethod] = useState(item.deliveryMethod ?? 'DIRECT')
  const [error, setError] = useState('')
  // DIRECT만 명세로 확인됨. 그 외 기존 서버 값은 변경 없이 보존할 수 있습니다.
  const [originalMethod] = useState(item.deliveryMethod)
  const options = originalMethod && originalMethod !== 'DIRECT' ? ['직접 전달', originalMethod] : ['직접 전달']
  const allowed = item.status === 'RESERVED'
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current || !allowed) return
    setError('')
    if (!date || !time || !address.trim() || !receiverName.trim()) { setError('날짜·시간·장소·수령인을 입력해 주세요.'); return }
    lock.current = true
    try {
      await mutation.mutateAsync({ matchId: item.matchId, body: {
        deliveryMethod: method,
        scheduledAt: date + 'T' + time + ':00+09:00',
        deliveryPlace: [address.trim(), detailAddress.trim()].filter(Boolean).join(', '),
        receiverName,
      } })
      navigate(audience === 'DONOR' ? routePath.donorRequestDetail(String(item.matchId)) : routePath.organizationActiveTradeDetail(String(item.matchId)), { replace: true })
    } catch (cause) { setError(matchErrorMessage(cause)) }
    finally { lock.current = false }
  }
  return <form className="flex min-h-dvh flex-col bg-surface-canvas" onSubmit={handleSubmit}>
    <header className="flex h-14 shrink-0 items-center gap-2 px-5">
      <button type="button" aria-label="뒤로가기" disabled={mutation.isPending} onClick={() => navigate(-1)} className="flex size-6 items-center justify-center text-primary-700"><ChevronLeft aria-hidden size={24} strokeWidth={2} /></button>
      <h1 className="typography-title-3 text-neutral-900">전달 약속 입력</h1>
    </header>
    <main className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
      {!allowed ? <p role="alert">예약중인 거래에서만 약속을 저장할 수 있어요.</p> : null}
      <fieldset disabled={!allowed || mutation.isPending} className="space-y-6">
        <DateField id="appointment-date" label="날짜" value={date} onChange={setDate} yearOrder="ascending" labelClassName="text-xs font-bold leading-[18px]" />
        <TimeField id="appointment-time" label="시간" value={time} onChange={setTime} labelClassName="text-xs font-bold leading-[18px]" />
        <AddressSearchField id="appointment-address" label="전달 장소" address={address} detailAddress={detailAddress} onAddressChange={setAddress} onDetailAddressChange={setDetailAddress} labelClassName="text-xs font-bold leading-[18px]" />
        <Input label="수령인" required value={receiverName} onChange={event => setReceiverName(event.target.value)} />
        <OptionCardGroup label="전달 방법" columns={2} options={options} value={method === 'DIRECT' ? '직접 전달' : method} onChange={value => setMethod(value === '직접 전달' ? 'DIRECT' : value)} />
      </fieldset>
      <p className="mt-4 text-xs font-normal leading-5 text-neutral-700">약속 시간은 한국 시간 기준입니다. 저장하면 상대방과 약속이 공유돼요.</p>
      {error ? <p role="alert" className="mt-2 text-error">{error}</p> : null}
    </main>
    <footer className="shrink-0 px-5 pb-4 pt-2"><Button type="submit" className="h-[46px] w-full" disabled={!allowed || mutation.isPending}>{mutation.isPending ? '저장 중...' : '약속 저장'}</Button></footer>
  </form>
}
function kstFields(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return { date: '', time: '' }
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value))
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? ''
  return { date: part('year') + '-' + part('month') + '-' + part('day'), time: part('hour') + ':' + part('minute') }
}
