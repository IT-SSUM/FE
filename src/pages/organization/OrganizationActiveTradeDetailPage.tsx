import type { ReactNode } from 'react'
import { ChevronLeft, MessageCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { matchErrorMessage, parseMatchId } from '@/apis/match'
import { Button } from '@/components/common/Button/Button'
import { getAuthSession } from '@/features/auth/storage'
import { MatchActions, matchStatusLabel } from '@/features/matches/MatchActions'
import { useMatchQuery } from '@/hooks/queries/useMatchQuery'
import { ROUTES } from '@/routes/paths'
import { cn } from '@/utils/cn'

const conditionLabels: Record<string, string> = {
  HIGH: '상 · 미개봉 또는 새 상품 수준',
  MID: '중 · 사용감이 있지만 양호함',
  LOW: '하 · 사용감이 많음',
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: '응답 대기', className: 'bg-warning-bg text-warning' },
  TRADING: { label: '거래중', className: 'bg-primary-100 text-primary-700' },
  RESERVED: { label: '예약중', className: 'bg-warning-bg text-warning' },
  COMPLETED: { label: '전달 완료', className: 'bg-success-bg text-success' },
  REJECTED: { label: '거절됨', className: 'bg-error-bg text-error' },
  CANCELED: { label: '거래 취소', className: 'bg-neutral-100 text-neutral-700' },
}

export function OrganizationActiveTradeDetailPage({
  authenticatedRole = null,
}: {
  authenticatedRole?: 'DONOR' | 'ORGANIZATION' | null
}) {
  const navigate = useNavigate()
  const { tradeId } = useParams()
  const id = parseMatchId(tradeId)
  const query = useMatchQuery(id)
  const trade = query.data
  const role = authenticatedRole ?? getAuthSession()?.role ?? null
  const status = trade ? statusConfig[trade.status] ?? {
    label: matchStatusLabel(trade.status),
    className: 'bg-neutral-100 text-neutral-700',
  } : null

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
          {status?.label ?? '거래 상세'}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-3">
        {id === null ? (
          <p className="py-12 text-center typography-body-2 text-error" role="alert">
            올바른 매칭 번호가 필요해요.
          </p>
        ) : query.isPending ? (
          <p className="py-12 text-center typography-body-2 text-neutral-700" role="status">
            거래 상세 정보를 불러오는 중이에요.
          </p>
        ) : query.isError ? (
          <div className="py-12 text-center" role="alert">
            <p className="typography-body-2 text-error">{matchErrorMessage(query.error)}</p>
            <Button variant="secondary" className="mt-4 h-10" onClick={() => void query.refetch()}>
              다시 시도
            </Button>
          </div>
        ) : trade && status ? (
          <>
            <section className="rounded-card border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold leading-6 text-neutral-900">
                  {trade.donorName} 님 · {trade.donationItemName} {trade.quantity}{trade.unit}
                </h2>
                <span className={cn('inline-flex h-7 shrink-0 items-center rounded-pill px-3 text-xs font-semibold', status.className)}>
                  {status.label}
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold leading-[18px] text-primary-700">
                거래중 → 예약중 → 전달 완료
              </p>
              {trade.status === 'RESERVED' ? (
                <p className="mt-3 text-xs font-normal leading-[18px] text-neutral-700">
                  기부자가 협의한 {trade.quantity}{trade.unit}를 예약했어요.
                </p>
              ) : null}
              {trade.status === 'CANCELED' && trade.cancelReason ? (
                <p className="mt-3 text-xs font-normal leading-[18px] text-error">
                  취소 사유: {trade.cancelReason}
                </p>
              ) : null}
            </section>

            <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
              <h2 className="text-base font-semibold leading-6 text-neutral-900">물품 및 수량</h2>
              <dl className="mt-4 space-y-3 text-xs leading-[18px]">
                <InfoRow label="기부 물품" value={trade.donationItemName} />
                <InfoRow label="필요 물품" value={trade.neededItemName} />
                <InfoRow label="거래 수량" value={`${trade.quantity}${trade.unit}`} />
                <InfoRow label="최초 수량" value={`${trade.initialQuantity}${trade.unit}`} />
                <InfoRow label="물품 상태" value={conditionLabels[trade.conditionGrade] ?? trade.conditionGrade} />
                <InfoRow label="물품 위치" value={trade.donationItemRegion} />
                <InfoRow label="기부 잔여" value={`${trade.donationItemRemainingQuantity}${trade.unit}`} />
                <InfoRow label="추가 필요" value={`${trade.neededItemAdditionalQuantity}${trade.unit}`} />
              </dl>
            </section>

            <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
              <h2 className="text-base font-semibold leading-6 text-neutral-900">전달 정보</h2>
              <dl className="mt-4 space-y-3 text-xs leading-[18px]">
                <InfoRow label="기부자" value={`${trade.donorName} 님`} />
                <InfoRow label="기관" value={trade.organizationName} />
                <InfoRow label="기관 주소" value={trade.organizationAddress} />
                <InfoRow label="수령 장소" value={trade.neededItemReceiveAddress || '아직 정하지 않았어요.'} />
                <InfoRow label="전달 방법" value={formatDeliveryMethod(trade.deliveryMethod)} />
                <InfoRow label="전달 일정" value={formatDateTime(trade.scheduledAt)} />
                {trade.deliveryPlace ? <InfoRow label="약속 장소" value={trade.deliveryPlace} /> : null}
                {trade.receiverName ? <InfoRow label="수령인" value={trade.receiverName} /> : null}
                {trade.completedAt ? <InfoRow label="완료 일시" value={formatDateTime(trade.completedAt)} /> : null}
              </dl>
            </section>

            <section className="mt-4">
              <h2 className="flex items-center gap-1.5 text-xs font-semibold leading-[18px] text-primary-700">
                <MessageCircle aria-hidden size={16} strokeWidth={2} />
                거래 메시지
              </h2>
              <p className="mt-2 rounded-control bg-primary-100 p-4 text-sm font-medium leading-[22px] text-neutral-900">
                {trade.message || '작성된 메시지가 없어요.'}
              </p>
            </section>
          </>
        ) : (
          <p className="py-12 text-center typography-body-2 text-neutral-700" role="status">
            거래 정보를 찾을 수 없어요.
          </p>
        )}
      </main>

      <footer className="shrink-0 px-5 pb-4 pt-2">
        {id !== null && trade && !query.isError ? (
          <MatchActions
            key={trade.matchId}
            match={trade}
            audience="ORGANIZATION"
            authenticatedRole={role}
          />
        ) : (
          <Button className="w-full" onClick={() => navigate(ROUTES.organization.offerList)}>
            목록으로
          </Button>
        )}
      </footer>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[76px_1fr] gap-3">
      <dt className="font-normal text-neutral-700">{label}</dt>
      <dd className="font-normal text-neutral-900">{value}</dd>
    </div>
  )
}

function formatDeliveryMethod(method: string | null) {
  if (method === 'DIRECT') return '직접 전달'
  if (method === 'PARCEL') return '택배 전달'
  return '아직 정하지 않았어요.'
}

function formatDateTime(value: string | null) {
  if (!value) return '아직 정하지 않았어요.'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '아직 정하지 않았어요.'
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
