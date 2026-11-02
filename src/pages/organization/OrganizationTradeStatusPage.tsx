import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { routePath } from '@/routes/paths'
import {
  OrganizationTradeCard,
  TradeStatusTabs,
} from './TradeStatusComponents'
import {
  organizationTrades,
  type OrganizationTradeStatus,
} from './organizationTrades'

export function OrganizationTradeStatusPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<OrganizationTradeStatus>('progress')
  const trades = organizationTrades.filter((trade) => trade.status === status)

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">거래 현황</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-3">
        <TradeStatusTabs status={status} onChange={setStatus} />
        <section className="mt-4 space-y-3" aria-label="거래 목록">
          {trades.map((trade) => (
            <OrganizationTradeCard
              key={trade.id}
              trade={trade}
              onClick={() =>
                navigate(routePath.organizationIndividualTradeStatus(trade.needId))
              }
            />
          ))}
        </section>
      </main>

      <BottomNavigation
        audience="organization"
        activeItem="my"
        className="sticky bottom-0 shrink-0"
      />
    </div>
  )
}
