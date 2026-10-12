import {
  CalendarCheck,
  ChevronLeft,
  MapPin,
  MessageCircle,
  Package,
  Phone,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import {
  TransactionStatus,
  type TransactionStatusVariant,
} from '@/components/common/TransactionStatus/TransactionStatus'
import { routePath } from '@/routes/paths'

type TradeDetail = {
  title: string
  status: TransactionStatusVariant
  organization: string
  manager: string
  phone: string
  quantity: string
  location: string
  schedule: string
  memo: string
}

const tradeDetailMap: Record<string, TradeDetail> = {
  'mock-trade-1': {
    title: '수건 30장',
    status: 'reserved' as const,
    organization: '기관 A',
    manager: '김담당',
    phone: '02-123-4567',
    quantity: '10장 예약 · 20장 가능',
    location: '서울 구로구 ○○로 12',
    schedule: '2026.10.18 오후 2시 협의 중',
    memo: '채팅으로 정확한 전달 장소와 시간을 조율하고 있어요.',
  },
  'mock-need-chat': {
    title: '아동 도서 12권',
    status: 'trading' as const,
    organization: 'A지역아동센터',
    manager: '박담당',
    phone: '02-987-6543',
    quantity: '12권',
    location: '서울 관악구 ○○로 8',
    schedule: '이번 주 내 전달 가능',
    memo: '기관에서 필요한 도서 종류를 확인 중이에요.',
  },
}

export function TradeDetailPage() {
  const navigate = useNavigate()
  const { tradeId } = useParams()
  const trade =
    tradeDetailMap[tradeId as keyof typeof tradeDetailMap] ??
    tradeDetailMap['mock-trade-1']

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
              {trade.title}
            </h2>
            <p className="mt-2 typography-body-2 text-neutral-700">
              {trade.organization} · {trade.manager}
            </p>
          </div>
          <TransactionStatus variant={trade.status} className="shrink-0" />
        </div>

        <section className="mt-5 rounded-card bg-primary-100 p-4">
          <h3 className="typography-title-3 text-neutral-900">거래 진행 상태</h3>
          <ol className="mt-4 grid grid-cols-3 gap-2 text-center">
            {['매칭 완료', '거래 진행', '전달 완료'].map((step, index) => {
              const active =
                trade.status === 'complete' ||
                (trade.status === 'reserved' && index < 2) ||
                (trade.status === 'trading' && index < 1)

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
              value={trade.quantity}
            />
            <TradeInfoRow
              icon={<MapPin aria-hidden size={18} strokeWidth={2} />}
              label="전달 위치"
              value={trade.location}
            />
            <TradeInfoRow
              icon={<CalendarCheck aria-hidden size={18} strokeWidth={2} />}
              label="전달 일정"
              value={trade.schedule}
            />
            <TradeInfoRow
              icon={<Phone aria-hidden size={18} strokeWidth={2} />}
              label="기관 연락처"
              value={trade.phone}
            />
          </dl>
        </section>

        <section className="mt-5">
          <h3 className="typography-title-2 text-neutral-900">메모</h3>
          <p className="mt-3 typography-body-1 text-neutral-900">
            {trade.memo}
          </p>
        </section>
      </main>

      <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-neutral-200 bg-surface-canvas px-5 py-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          닫기
        </Button>
        <Button
          className="gap-2"
          onClick={() => navigate(routePath.chatRoom('mock-need-chat'))}
        >
          <MessageCircle aria-hidden size={18} strokeWidth={2} />
          채팅
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
