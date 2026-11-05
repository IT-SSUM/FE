import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { SegmentedTabs } from '@/components/common/SegmentedTabs/SegmentedTabs'
import { routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'
import { useMatchesQuery } from '@/hooks/queries/useMatchesQuery'
import { matchErrorMessage } from '@/apis/match'
import { matchDirection, matchStatusLabel } from '@/features/matches/MatchActions'
import type { MatchListItem } from '@/types/match'
type ApiOffer = MatchListItem & { direction: 'received' | 'sent' | null }

type OfferTab = 'received' | 'sent'

const tabLabels: Record<OfferTab, string> = {
  received: '받은 제안',
  sent: '보낸 요청',
}

export function OfferListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'sent' ? 'sent' : 'received'
  const [tab, setTab] = useState<OfferTab>(initialTab)
  const query = useMatchesQuery()
  const allOffers: ApiOffer[] = (query.data ?? []).map(item => ({ ...item, direction: matchDirection(item.requestedBy, 'ORGANIZATION') }))
  const offers = allOffers.filter((offer) => offer.direction === tab || offer.direction === null)

  const selectTab = (nextTab: OfferTab) => {
    setTab(nextTab)
    setSearchParams(nextTab === 'sent' ? { tab: 'sent' } : {}, { replace: true })
  }

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
        <h1 className="typography-title-3 text-neutral-900">받은 제안 · 보낸 요청</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-3">
        <SegmentedTabs
          ariaLabel="제안과 요청 구분"
          value={tab}
          onChange={(value) => selectTab(value as OfferTab)}
          itemClassName="min-w-[96px]"
          items={(['received', 'sent'] as const).map((value) => ({
            value,
            label: `${tabLabels[value]} ${allOffers.filter((offer) => offer.direction === value).length}`,
          }))}
        />

        <section className="mt-4 space-y-4" aria-label={tabLabels[tab]}>
          {query.isPending ? <p role="status">목록을 불러오고 있어요.</p> : null}
          {query.isError ? <div role="alert">{matchErrorMessage(query.error)} <button type="button" onClick={() => void query.refetch()}>다시 시도</button></div> : null}
          {!query.isPending && !query.isError && offers.length === 0 ? <p role="status">해당하는 제안·요청이 없어요.</p> : null}
          {offers.map((offer) => (
            <OfferCard
              key={offer.matchId}
              offer={offer}
              onClick={() => navigate(routePath.organizationOfferDetail(String(offer.matchId)))}
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

function OfferCard({ offer, onClick }: { offer: ApiOffer; onClick: () => void }) {
  const isProgress = offer.status === 'TRADING' || offer.status === 'RESERVED'

  return (
    <article className="rounded-card border border-neutral-200 bg-white p-4">
      <h2 className="text-base font-semibold leading-6 text-neutral-900">
        {offer.donorName} 님
      </h2>
      <p className="mt-2 text-xs font-normal leading-[18px] text-neutral-700">
        {offer.donationItemName} {offer.quantity}{offer.unit} · {offer.donationItemRegion}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={cn(
            'inline-flex h-7 items-center rounded-pill px-3 text-xs font-medium',
            isProgress
              ? 'bg-primary-100 text-primary-700'
              : 'bg-warning-bg text-warning',
          )}
        >
          {matchStatusLabel(offer.status)}
        </span>
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700"
        >
          {offer.direction === 'received' ? '자세히 보기' : '요청 내용 보기'}
          <ChevronRight aria-hidden size={16} strokeWidth={2} />
        </button>
      </div>
    </article>
  )
}
