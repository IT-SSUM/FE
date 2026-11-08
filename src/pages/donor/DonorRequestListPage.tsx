import { ChevronLeft, ClipboardList } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { routePath } from '@/routes/paths'

import { useMatchesQuery } from '@/hooks/queries/useMatchesQuery'
import { matchErrorMessage } from '@/apis/match'
import { matchDirection, matchStatusLabel } from '@/features/matches/MatchActions'
import { TransactionStatus } from '@/components/common/TransactionStatus/TransactionStatus'

export function DonorRequestListPage({ authenticatedRole = null }: { authenticatedRole?: 'DONOR' | 'ORGANIZATION' | null }) {
  const navigate = useNavigate()
  const query = useMatchesQuery()
  const [params, setParams] = useSearchParams()
  const canClassify = authenticatedRole === 'DONOR'
  const filter = canClassify ? params.get('filter') ?? '전체' : '전체'
  const current = (query.data ?? []).map((item) => ({
    id: String(item.matchId), title: canClassify ? item.organizationName : `${item.donorName} · ${item.organizationName}`,
    item: `${item.donationItemName} ${item.quantity}${item.unit}`,
    meta: item.neededItemRegion, status: item.status,
    direction: matchDirection(item.requestedBy, canClassify ? authenticatedRole : null),
  }))
  const filtered = current.filter((item) => filter === '전체' || (filter === '받은 요청' && item.direction === 'received') || (filter === '보낸 제안' && item.direction === 'sent') || (filter === '확정' && item.status === 'RESERVED'))

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
        <h1 className="typography-title-3 text-neutral-900">
          {canClassify ? '보낸 제안 / 받은 요청' : '제안·요청 목록'}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        {query.isPending ? <p role="status">목록을 불러오고 있어요.</p> : null}
        {query.isError ? <div role="alert">{matchErrorMessage(query.error)} <button type="button" onClick={() => void query.refetch()}>다시 시도</button></div> : null}
        <section className="grid grid-cols-2 gap-3">
          <SummaryCard label="받은 요청" value={canClassify ? `${current.filter((item) => item.direction === 'received').length}건` : '역할 확인 필요'} />
          <SummaryCard label="보낸 제안" value={canClassify ? `${current.filter((item) => item.direction === 'sent').length}건` : '역할 확인 필요'} />
        </section>

        <div className="mt-4 flex gap-2 overflow-x-auto">
          {['전체', '받은 요청', '보낸 제안', '확정'].map((value) => (
            <button
              key={value}
              disabled={!canClassify && value !== '전체'}
              aria-pressed={filter === value}
              onClick={() => setParams({ filter: value }, { replace: true })}
              type="button"
              className={`shrink-0 rounded-pill border border-neutral-200 px-3 py-2 typography-label-1 ${filter === value ? 'bg-primary-100 text-primary-700' : 'bg-white text-neutral-700'}`}
            >
              {value}
            </button>
          ))}
        </div>

        <section className="mt-4 space-y-3" aria-label="요청 및 제안 목록">
          {!query.isPending && !query.isError && filtered.length === 0 ? <p role="status">해당하는 요청이나 제안이 없어요.</p> : null}
          {filtered.map((item) => (
            <ItemRow
              key={item.id}
              title={item.title}
              description={
                <>
                  <p>{item.item}</p>
                  <p>{item.meta}</p>
                  <TransactionStatus variant={item.status === 'RESERVED' ? 'reserved' : 'trading'}>{matchStatusLabel(item.status)}</TransactionStatus>
                </>
              }
              statusType="transaction"
              statusPlacement="bottom"
              icon={<ClipboardList aria-hidden size={30} strokeWidth={2} />}
              thumbnailClassName="h-[76px] w-[68px] rounded-input !bg-primary-100"
              className="gap-3 p-4 shadow-none"
              descriptionClassName="typography-label-2 line-clamp-none"
              onClick={() => navigate(routePath.donorRequestDetail(item.id))}
            />
          ))}
        </section>
      </main>

      <BottomNavigation activeItem="my" className="sticky bottom-0 shrink-0" />
    </div>
  )
}

type SummaryCardProps = {
  label: string
  value: string
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-card border border-neutral-200 bg-white p-4">
      <p className="typography-label-2 text-neutral-700">{label}</p>
      <p className="mt-1 typography-title-1 text-primary-700">{value}</p>
    </div>
  )
}
