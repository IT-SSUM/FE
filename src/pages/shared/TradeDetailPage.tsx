import {
  CalendarCheck,
  ChevronLeft,
  MapPin,
  Package,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import {
  TransactionStatus,
} from '@/components/common/TransactionStatus/TransactionStatus'
import { useMatchQuery } from '@/hooks/queries/useMatchQuery'
import { parseMatchId, matchErrorMessage } from '@/apis/match'
import { matchStatusLabel } from '@/features/matches/MatchActions'

export function TradeDetailPage() {
  const navigate = useNavigate()
  const { tradeId } = useParams()
  const id = parseMatchId(tradeId)
  const query = useMatchQuery(id)
  const trade = query.data
  if (id === null || query.isPending || query.isError || !trade) return <div className="min-h-dvh bg-surface-canvas p-5">
    <h1 className="typography-title-3">거래 상세</h1>
    <p role={query.isError ? 'alert' : 'status'}>{id === null ? '올바른 매칭 번호가 필요해요.' : query.isError ? matchErrorMessage(query.error) : query.isPending ? '불러오는 중이에요.' : '거래 정보를 찾을 수 없어요.'}</p>
    {query.isError ? <Button onClick={() => void query.refetch()}>다시 시도</Button> : null}
    <Button variant="secondary" onClick={() => navigate(-1)}>뒤로가기</Button>
  </div>

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">거래 상세</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="typography-heading-2 text-neutral-900">
              {trade.donationItemName}
            </h2>
            <p className="mt-2 typography-body-2 text-neutral-700">
              {trade.neededItemName}
            </p>
          </div>
          <TransactionStatus variant={trade.status === 'RESERVED' ? 'reserved' : 'trading'} className="shrink-0">{matchStatusLabel(trade.status)}</TransactionStatus>
        </div>

        <section className="mt-5 rounded-card bg-primary-100 p-4">
          <h3 className="typography-title-3 text-neutral-900">거래 진행 상태</h3>
          <ol className="mt-4 grid grid-cols-3 gap-2 text-center">
            {['매칭 완료', '거래 진행', '전달 완료'].map((step, index) => {
              const active =
                Boolean(trade.completedAt) ||
                (trade.status === 'RESERVED' && index < 2) ||
                (trade.status === 'TRADING' && index < 1)

              return (
                <li key={step}>
                  <span
                    className={`mx-auto flex size-8 items-center justify-center rounded-full typography-label-1 ${
                      active
                        ? 'bg-primary-700 text-white'
                        : 'bg-white text-neutral-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <p className="mt-2 typography-label-2 text-neutral-700">
                    {step}
                  </p>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="mt-5 rounded-card border border-neutral-200 bg-white p-4">
          <h3 className="typography-title-3 text-neutral-900">거래 정보</h3>
          <dl className="mt-4 space-y-3 typography-body-2">
            <TradeInfoRow
              icon={<Package aria-hidden size={18} strokeWidth={2} />}
              label="거래 수량"
              value={String(trade.quantity)}
            />
            <TradeInfoRow
              icon={<MapPin aria-hidden size={18} strokeWidth={2} />}
              label="전달 위치"
              value={trade.deliveryPlace ?? '미정'}
            />
            <TradeInfoRow
              icon={<CalendarCheck aria-hidden size={18} strokeWidth={2} />}
              label="전달 일정"
              value={trade.scheduledAt ?? '미정'}
            />

          </dl>
        </section>

        <section className="mt-5">
          <h3 className="typography-title-2 text-neutral-900">메모</h3>
          <p className="mt-3 typography-body-1 text-neutral-900">
            {trade.message}
          </p>
        </section>
      </main>

      <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-neutral-200 bg-surface-canvas px-5 py-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          닫기
        </Button>

      </footer>
    </div>
  )
}

type TradeInfoRowProps = {
  icon: ReactNode
  label: string
  value: string
}

function TradeInfoRow({ icon, label, value }: TradeInfoRowProps) {
  return (
    <div className="grid grid-cols-[24px_76px_1fr] items-start gap-2">
      <dt className="contents">
        <span className="mt-0.5 text-primary-700">{icon}</span>
        <span className="text-neutral-700">{label}</span>
      </dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  )
}
