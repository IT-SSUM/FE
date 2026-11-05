import { ChevronLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { ROUTES } from '@/routes/paths'
import { parseMatchId, matchErrorMessage } from '@/apis/match'
import { useMatchQuery } from '@/hooks/queries/useMatchQuery'
import { MatchActions, matchStatusLabel } from '@/features/matches/MatchActions'

export function OrganizationActiveTradeDetailPage() {
  const navigate = useNavigate()
  const { tradeId } = useParams()
  const id = parseMatchId(tradeId)
  const query = useMatchQuery(id)
  const trade = query.data
  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button type="button" aria-label="뒤로가기" onClick={() => navigate(-1)} className="flex size-6 items-center justify-center text-primary-700">
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">{trade ? matchStatusLabel(trade.status) : '거래 상세'}</h1>
      </header>
      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-3">
        {id === null ? <p role="alert">올바른 매칭 번호가 필요해요.</p>
          : query.isError ? <div role="alert">{matchErrorMessage(query.error)} <Button onClick={() => void query.refetch()}>다시 시도</Button></div>
          : query.isPending ? <p role="status">거래 정보를 불러오고 있어요.</p>
          : !trade ? <p role="status">거래 정보를 찾을 수 없어요.</p>
          : <>
            <section className="rounded-card border border-neutral-200 bg-white p-4">
              <h2 className="text-base font-semibold leading-6 text-neutral-900">{trade.donationItemName} · 수량 {trade.quantity}</h2>
              <p className="mt-3 text-xs font-semibold leading-[18px] text-primary-700">{matchStatusLabel(trade.status)}</p>
            </section>
            <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
              <h2 className="text-base font-semibold leading-6 text-neutral-900">거래 정보</h2>
              <dl className="mt-4 space-y-3 text-xs leading-[18px]">
                <InfoRow label="기부 물품" value={trade.donationItemName} />
                <InfoRow label="필요 물품" value={trade.neededItemName} />
                <InfoRow label="합의 수량" value={String(trade.quantity)} />
                <InfoRow label="최초 수량" value={String(trade.initialQuantity)} />
              </dl>
            </section>
            <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
              <h2 className="text-base font-semibold leading-6 text-neutral-900">전달 약속</h2>
              <dl className="mt-4 space-y-3 text-xs leading-[18px]">
                <InfoRow label="일정" value={trade.scheduledAt ?? '미정'} />
                <InfoRow label="장소" value={trade.deliveryPlace ?? '미정'} />
                <InfoRow label="방법" value={trade.deliveryMethod ?? '미정'} />
                <InfoRow label="수령인" value={trade.receiverName ?? '미정'} />
              </dl>
            </section>
          </>}
      </main>
      <footer className="shrink-0 px-5 pb-4 pt-2">
        {id !== null && trade && !query.isError ? <MatchActions key={trade.matchId} match={trade} audience="ORGANIZATION" /> : <Button onClick={() => navigate(ROUTES.organization.offerList)}>목록으로</Button>}
      </footer>
    </div>
  )
}
function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[76px_1fr] gap-3"><dt className="font-normal text-neutral-700">{label}</dt><dd className="font-normal text-neutral-900">{value}</dd></div>
}
