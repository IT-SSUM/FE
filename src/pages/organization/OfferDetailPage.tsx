import type { ReactNode } from 'react'
import { ChevronLeft, MessageCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { matchErrorMessage, parseMatchId } from '@/apis/match'
import { Button } from '@/components/common/Button/Button'
import { getAuthSession } from '@/features/auth/storage'
import { MatchActions, matchDirection, matchStatusLabel } from '@/features/matches/MatchActions'
import { useMatchQuery } from '@/hooks/queries/useMatchQuery'
import { ROUTES, routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'

const conditionLabels: Record<string, string> = {
  HIGH: '상 · 미개봉 또는 새 상품 수준',
  MID: '중 · 사용감이 있지만 양호함',
  LOW: '하 · 사용감이 많음',
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: '응답 대기', className: 'bg-warning-bg text-warning' },
  TRADING: { label: '거래중', className: 'bg-primary-100 text-primary-700' },
  RESERVED: { label: '예약 완료', className: 'bg-primary-100 text-primary-700' },
  COMPLETED: { label: '거래 완료', className: 'bg-success-bg text-success' },
  REJECTED: { label: '거절됨', className: 'bg-error-bg text-error' },
  CANCELED: { label: '취소됨', className: 'bg-neutral-100 text-neutral-700' },
}

export function OfferDetailPage({
  authenticatedRole = null,
}: {
  authenticatedRole?: 'DONOR' | 'ORGANIZATION' | null
}) {
  const navigate = useNavigate()
  const { offerId } = useParams()
  const id = parseMatchId(offerId)
  const query = useMatchQuery(id)
  const offer = query.data
  const role = authenticatedRole ?? getAuthSession()?.role ?? null
  const direction = offer
    ? matchDirection(offer.requestedBy, role === 'ORGANIZATION' ? role : null)
    : null
  const isReceived = direction === 'received'
  const status = offer ? statusConfig[offer.status] ?? {
    label: matchStatusLabel(offer.status),
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
          {!direction ? '제안 · 요청 상세' : isReceived ? '받은 제안' : '보낸 요청'}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
        {id === null ? (
          <p className="py-12 text-center typography-body-2 text-error" role="alert">
            올바른 매칭 번호가 필요해요.
          </p>
        ) : query.isPending ? (
          <p className="py-12 text-center typography-body-2 text-neutral-700" role="status">
            상세 정보를 불러오는 중이에요.
          </p>
        ) : query.isError ? (
          <div className="py-12 text-center" role="alert">
            <p className="typography-body-2 text-error">{matchErrorMessage(query.error)}</p>
            <Button variant="secondary" className="mt-4 h-10" onClick={() => void query.refetch()}>
              다시 시도
            </Button>
          </div>
        ) : offer && status ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold leading-8 text-neutral-900">
                {isReceived
                  ? `${offer.donorName} 님의 기부 제안`
                  : `${offer.donorName} 님에게 보낸 요청`}
              </h2>
              <span className={cn('mt-0.5 inline-flex h-7 shrink-0 items-center rounded-pill px-3 text-xs font-medium', status.className)}>
                {status.label}
              </span>
            </div>

            <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
              <h3 className="text-base font-semibold leading-6 text-neutral-900">
                {isReceived ? '제안' : '요청'} {offer.quantity}{offer.unit} · 추가 필요 수량 {offer.neededItemAdditionalQuantity}{offer.unit}
              </h3>
              <dl className="mt-4 space-y-3 text-xs leading-[18px]">
                <InfoRow label="기부 물품" value={offer.donationItemName} />
                <InfoRow label="필요 물품" value={offer.neededItemName} />
                <InfoRow label="최초 수량" value={`${offer.initialQuantity}${offer.unit}`} />
                <InfoRow label="물품 상태" value={conditionLabels[offer.conditionGrade] ?? offer.conditionGrade} />
                <InfoRow label="기부자" value={`${offer.donorName} 님`} />
                <InfoRow label="기관" value={offer.organizationName} />
                <InfoRow label="기관 주소" value={offer.organizationAddress} />
                <InfoRow label="수령 주소" value={offer.neededItemReceiveAddress || '아직 정하지 않았어요.'} />
                <InfoRow label="물품 위치" value={offer.donationItemRegion} />
                <InfoRow
                  label="기부 잔여"
                  value={formatQuantity(offer.donationItemRemainingQuantity, offer.unit)}
                />
                {offer.deliveryMethod ? (
                  <InfoRow label="전달 방법" value={offer.deliveryMethod === 'DIRECT' ? '직접 전달' : '택배'} />
                ) : null}
                {offer.cancelReason ? <InfoRow label="취소 사유" value={offer.cancelReason} /> : null}
              </dl>
            </section>

            <section className="mt-4">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold leading-[18px] text-primary-700">
                <MessageCircle aria-hidden size={16} strokeWidth={2} />
                {isReceived ? '기부자가 보낸 메시지' : '기관에서 보낸 메시지'}
              </h3>
              <p className="mt-2 rounded-control bg-primary-100 p-4 text-sm font-medium leading-[22px] text-neutral-900">
                {offer.message || '작성된 메시지가 없어요.'}
              </p>
            </section>

            {offer.status === 'PENDING' ? (
              <p className="mt-4 text-xs font-normal leading-5 text-neutral-700">
                {isReceived
                  ? '기부자가 물품을 전달하고 싶다는 제안이에요.'
                  : '상대방의 응답을 기다리고 있어요.'}
              </p>
            ) : null}
          </>
        ) : (
          <p className="py-12 text-center typography-body-2 text-neutral-700" role="status">
            제안 또는 요청 정보를 찾을 수 없어요.
          </p>
        )}
      </main>

      {id !== null && offer && !query.isError ? (
        <footer className="shrink-0 px-5 pb-4 pt-2">
          <MatchActions
            key={offer.matchId}
            match={offer}
            audience="ORGANIZATION"
            authenticatedRole={role}
          />
          {offer.status === 'TRADING' || offer.status === 'RESERVED' ? (
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => navigate(routePath.organizationActiveTradeDetail(String(offer.matchId)))}
            >
              거래 상세
            </Button>
          ) : null}
        </footer>
      ) : id === null || query.isError ? (
        <footer className="shrink-0 px-5 pb-4 pt-2">
          <Button className="w-full" onClick={() => navigate(ROUTES.organization.offerList)}>
            목록으로
          </Button>
        </footer>
      ) : null}
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

function formatQuantity(quantity: number | undefined, unit: string) {
  return Number.isFinite(quantity) ? `${quantity}${unit}` : '확인할 수 없어요.'
}
