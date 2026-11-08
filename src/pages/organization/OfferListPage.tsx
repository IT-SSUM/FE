import { useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  getMatchErrorMessage,
  type MatchListItem,
  type MatchStatus,
} from '@/apis/matches'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { SegmentedTabs } from '@/components/common/SegmentedTabs/SegmentedTabs'
import { useMatches } from '@/hooks/matches/useMatches'
import { routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'

type OfferTab = 'received' | 'sent'

const tabLabels: Record<OfferTab, string> = {
  received: '받은 제안',
  sent: '보낸 요청',
}

const statusConfig: Record<MatchStatus, { label: string; className: string }> = {
  PENDING: { label: '응답 대기', className: 'bg-warning-bg text-warning' },
  TRADING: { label: '거래중', className: 'bg-primary-100 text-primary-700' },
  RESERVED: { label: '예약 완료', className: 'bg-primary-100 text-primary-700' },
  COMPLETED: { label: '거래 완료', className: 'bg-success-bg text-success' },
  REJECTED: { label: '거절됨', className: 'bg-error-bg text-error' },
  CANCELED: { label: '취소됨', className: 'bg-neutral-100 text-neutral-700' },
}

export function OfferListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'sent' ? 'sent' : 'received'
  const [tab, setTab] = useState<OfferTab>(initialTab)
  const matchesQuery = useMatches()
  const matches = matchesQuery.data ?? []
  const receivedOffers = matches.filter((match) => match.requestedBy === 'DONOR')
  const sentRequests = matches.filter((match) => match.requestedBy === 'ORGANIZATION')
  const offers = tab === 'received' ? receivedOffers : sentRequests
  const errorMessage = matchesQuery.error
    ? getMatchErrorMessage(matchesQuery.error, '제안과 요청 목록을 불러오지 못했어요.')
    : ''

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
          items={([
            { value: 'received' as const, count: receivedOffers.length },
            { value: 'sent' as const, count: sentRequests.length },
          ]).map(({ value, count }) => ({
            value,
            label: `${tabLabels[value]} ${count}`,
          }))}
        />

        <section className="mt-4 space-y-4" aria-label={tabLabels[tab]}>
          {matchesQuery.isLoading ? (
            <p className="py-12 text-center typography-body-2 text-neutral-700" role="status">제안과 요청을 불러오는 중이에요.</p>
          ) : matchesQuery.isError ? (
            <div className="py-12 text-center" role="alert">
              <p className="typography-body-2 text-error">{errorMessage}</p>
              <Button variant="secondary" className="mt-4 h-10" onClick={() => void matchesQuery.refetch()}>다시 시도</Button>
            </div>
          ) : offers.length === 0 ? (
            <div className="rounded-card bg-neutral-100 px-5 py-12 text-center">
              <ClipboardList aria-hidden size={36} className="mx-auto text-neutral-500" />
              <p className="mt-3 typography-body-2 text-neutral-700">{tabLabels[tab]} 내역이 없어요.</p>
            </div>
          ) : (
            offers.map((offer) => (
              <OfferCard
                key={offer.matchId}
                offer={offer}
                direction={tab}
                onClick={() => navigate(routePath.organizationOfferDetail(String(offer.matchId)))}
              />
            ))
          )}
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

type OfferCardProps = {
  offer: MatchListItem
  direction: OfferTab
  onClick: () => void
}

function OfferCard({ offer, direction, onClick }: OfferCardProps) {
  const status = statusConfig[offer.status]

  return (
    <article className="rounded-card border border-neutral-200 bg-white p-4">
      <h2 className="text-base font-semibold leading-6 text-neutral-900">
        {offer.donorName} 님
      </h2>
      <p className="mt-2 text-xs font-normal leading-[18px] text-neutral-700">
        {offer.donationItemName} {offer.quantity}{offer.unit} · {offer.donationItemRegion}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className={cn('inline-flex h-7 items-center rounded-pill px-3 text-xs font-medium', status.className)}>
          {status.label}
        </span>
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700"
        >
          {direction === 'received' ? '자세히 보기' : '요청 내용 보기'}
          <ChevronRight aria-hidden size={16} strokeWidth={2} />
        </button>
      </div>
    </article>
  )
}
