import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { SegmentedTabs } from '@/components/common/SegmentedTabs/SegmentedTabs'
import { routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'
import { organizationOffers, type OrganizationOffer } from './organizationOffers'

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
  const offers = organizationOffers.filter((offer) => offer.direction === tab)

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
            label: `${tabLabels[value]} ${organizationOffers.filter((offer) => offer.direction === value).length}`,
          }))}
        />

        <section className="mt-4 space-y-4" aria-label={tabLabels[tab]}>
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onClick={() => navigate(routePath.organizationOfferDetail(offer.id))}
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

function OfferCard({ offer, onClick }: { offer: OrganizationOffer; onClick: () => void }) {
  const isProgress = offer.status === 'progress'

  return (
    <article className="rounded-card border border-neutral-200 bg-white p-4">
      <h2 className="text-base font-semibold leading-6 text-neutral-900">
        {offer.donorName} 님
      </h2>
      <p className="mt-2 text-xs font-normal leading-[18px] text-neutral-700">
        {offer.itemSummary} · {offer.location}
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
          {isProgress ? '거래중' : '응답 대기'}
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
