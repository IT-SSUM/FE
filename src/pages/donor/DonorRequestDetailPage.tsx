import { ChevronLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { TransactionStatus } from '@/components/common/TransactionStatus/TransactionStatus'
import { ROUTES, routePath } from '@/routes/paths'

import { useMatchQuery } from '@/hooks/queries/useMatchQuery'
import { matchErrorMessage, parseMatchId } from '@/apis/match'
import { MatchActions, matchStatusLabel } from '@/features/matches/MatchActions'

export function DonorRequestDetailPage() {
  const navigate = useNavigate()
  const { requestId } = useParams()
  const id = parseMatchId(requestId)
  const query = useMatchQuery(id)
  const request = query.data
  if (id === null || query.isPending || query.isError || !request) return <div className="min-h-dvh bg-surface-canvas p-5">
    <h1 className="typography-title-3">요청 상세</h1>
    <p role={query.isError ? 'alert' : 'status'}>{id === null ? '올바른 매칭 번호가 필요해요.' : query.isError ? matchErrorMessage(query.error) : query.isPending ? '불러오는 중이에요.' : '매칭 정보를 찾을 수 없어요.'}</p>
    {query.isError ? <Button onClick={() => void query.refetch()}>다시 시도</Button> : null}
    <Button variant="secondary" onClick={() => navigate(ROUTES.donor.myRequests)}>목록으로</Button>
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
        <h1 className="typography-title-3 text-neutral-900">요청 상세</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="typography-heading-2 text-neutral-900">
              {request.donationItemName}
            </h2>
            <p className="mt-2 typography-body-2 text-neutral-700">
              {request.neededItemName}
            </p>
          </div>
          <TransactionStatus variant={request.status === 'RESERVED' ? 'reserved' : 'trading'} className="shrink-0">{matchStatusLabel(request.status)}</TransactionStatus>
        </div>

        <section className="mt-5 rounded-card border border-neutral-200 bg-white p-4">
          <dl className="space-y-2 typography-body-2">
            <InfoRow label="연결 물품" value={request.donationItemName} />
            <InfoRow label="신청 수량" value={String(request.quantity)} />
            <InfoRow label="최초 신청 수량" value={String(request.initialQuantity)} />
          </dl>
        </section>

        <section className="mt-5">
          <h3 className="typography-title-2 text-neutral-900">요청 내용</h3>
          <p className="mt-3 typography-body-1 text-neutral-900">
            {request.message}
          </p>
        </section>
      </main>

      <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-neutral-200 bg-surface-canvas px-5 py-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          닫기
        </Button>
        <MatchActions key={request.matchId} match={request} audience="DONOR" />
        {request.status === 'TRADING' || request.status === 'RESERVED' ? <Button variant="secondary" onClick={() => navigate(routePath.tradeDetail(String(request.matchId)))}>거래 상세</Button> : null}
      </footer>
    </div>
  )
}

type InfoRowProps = {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2">
      <dt className="text-neutral-700">{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  )
}
