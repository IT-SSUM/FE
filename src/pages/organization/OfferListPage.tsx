import { useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { matchErrorMessage } from '@/apis/match'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { SegmentedTabs } from '@/components/common/SegmentedTabs/SegmentedTabs'
import { getAuthSession } from '@/features/auth/storage'
import { matchDirection, matchStatusLabel } from '@/features/matches/MatchActions'
import { useMatchesQuery } from '@/hooks/queries/useMatchesQuery'
import { routePath } from '@/routes/paths'
import type { MatchListItem } from '@/types/match'
import { cn } from '@/utils/cn'

type OfferTab = 'received' | 'sent'
type ApiOffer = MatchListItem & { direction: OfferTab | null }

const tabLabels: Record<OfferTab, string> = {
  received: '받은 제안',
  sent: '보낸 요청',
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: '응답 대기', className: 'bg-warning-bg text-warning' },
  TRADING: { label: '거래중', className: 'bg-primary-100 text-primary-700' },
  RESERVED: { label: '예약 완료', className: 'bg-primary-100 text-primary-700' },
  COMPLETED: { label: '거래 완료', className: 'bg-success-bg text-success' },
  REJECTED: { label: '거절됨', className: 'bg-error-bg text-error' },
  CANCELED: { label: '취소됨', className: 'bg-neutral-100 text-neutral-700' },
}

export function OfferListPage({
  authenticatedRole = null,
}: {
  authenticatedRole?: 'DONOR' | 'ORGANIZATION' | null
}) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'sent' ? 'sent' : 'received'
  const [tab, setTab] = useState<OfferTab>(initialTab)
  const query = useMatchesQuery()
  const role = authenticatedRole ?? getAuthSession()?.role ?? null
  const canClassify = role === 'ORGANIZATION'
  const allOffers: ApiOffer[] = (query.data ?? []).map((item) => ({
    ...item,
    direction: matchDirection(item.requestedBy, canClassify ? role : null),
  }))
  const receivedOffers = allOffers.filter((offer) => offer.direction === 'received')
  const sentRequests = allOffers.filter((offer) => offer.direction === 'sent')
  const offers = canClassify
    ? tab === 'received' ? receivedOffers : sentRequests
    : allOffers

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
        <h1 className="typography-title-3 text-neutral-900">
          {canClassify ? '받은 제안 · 보낸 요청' : '제안 · 요청 목록'}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-3">
        {canClassify ? (
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
        ) : (
          <p role="status" className="typography-body-2 text-neutral-700">
            로그인 역할 확인 전에는 전체 제안·요청을 표시합니다.
          </p>
        )}

        <section
          className="mt-4 space-y-4"
          aria-label={canClassify ? tabLabels[tab] : '전체 제안·요청'}
        >
          {query.isPending ? (
            <p className="py-12 text-center typography-body-2 text-neutral-700" role="status">
              제안과 요청을 불러오는 중이에요.
            </p>
          ) : query.isError ? (
            <div className="py-12 text-center" role="alert">
              <p className="typography-body-2 text-error">{matchErrorMessage(query.error)}</p>
              <Button variant="secondary" className="mt-4 h-10" onClick={() => void query.refetch()}>
                다시 시도
              </Button>
            </div>
          ) : offers.length === 0 ? (
            <div className="rounded-card bg-neutral-100 px-5 py-12 text-center">
              <ClipboardList aria-hidden size={36} className="mx-auto text-neutral-500" />
              <p className="mt-3 typography-body-2 text-neutral-700">
                {canClassify ? `${tabLabels[tab]} 내역이 없어요.` : '제안·요청 내역이 없어요.'}
              </p>
            </div>
          ) : (
            offers.map((offer) => (
              <OfferCard
                key={offer.matchId}
                offer={offer}
                onClick={() => navigate(routePath.organizationOfferDetail(String(offer.matchId)))}
              />
            ))
          )}
        </section>
      </main>

      <BottomNavigation audience="organization" activeItem="my" className="sticky bottom-0 shrink-0" />
    </div>
  )
}

function OfferCard({ offer, onClick }: { offer: ApiOffer; onClick: () => void }) {
  const status = statusConfig[offer.status] ?? {
    label: matchStatusLabel(offer.status),
    className: 'bg-neutral-100 text-neutral-700',
  }

  return (
    <article className="rounded-card border border-neutral-200 bg-white p-4">
      <h2 className="text-base font-semibold leading-6 text-neutral-900">
        {offer.direction ? `${offer.donorName} 님` : `${offer.donorName} · ${offer.organizationName}`}
      </h2>
      <p className="mt-2 text-xs font-normal leading-[18px] text-neutral-700">
        {offer.donationItemName} {offer.quantity}{offer.unit} · {offer.donationItemRegion}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className={cn('inline-flex h-7 items-center rounded-pill px-3 text-xs font-medium', status.className)}>
          {status.label}
        </span>
        <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700">
          {offer.direction === 'sent' ? '요청 내용 보기' : '자세히 보기'}
          <ChevronRight aria-hidden size={16} strokeWidth={2} />
        </button>
      </div>
    </article>
  )
}
