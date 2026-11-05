import { type ReactNode } from 'react'
import { ChevronLeft, MessageCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { ROUTES } from '@/routes/paths'
import { useMatchQuery } from '@/hooks/queries/useMatchQuery'
import { matchErrorMessage, parseMatchId } from '@/apis/match'
import { MatchActions, matchDirection, matchStatusLabel } from '@/features/matches/MatchActions'

export function OfferDetailPage() {
  const navigate = useNavigate()
  const { offerId } = useParams()
  const id = parseMatchId(offerId)
  const query = useMatchQuery(id)
  const offer = query.data
  const isReceived = offer && matchDirection(offer.requestedBy, 'ORGANIZATION') === 'received'
  if (id === null || query.isPending || query.isError || !offer) return <div className="min-h-dvh bg-surface-canvas p-5">
    <h1 className="typography-title-3">제안·요청 상세</h1>
    <p role={query.isError ? 'alert' : 'status'}>{id === null ? '올바른 매칭 번호가 필요해요.' : query.isError ? matchErrorMessage(query.error) : query.isPending ? '불러오는 중이에요.' : '매칭 정보를 찾을 수 없어요.'}</p>
    {query.isError ? <Button onClick={() => void query.refetch()}>다시 시도</Button> : null}
    <Button variant="secondary" onClick={() => navigate(ROUTES.organization.offerList)}>목록으로</Button>
  </div>

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
          {isReceived ? '받은 제안' : '보낸 요청'}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <h2 className="text-xl font-bold leading-8 text-neutral-900">
          {isReceived
            ? `${offer.donationItemName} 기부 제안`
            : `${offer.donationItemName} 요청`}
        </h2>

        <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
          <h3 className="text-base font-semibold leading-6 text-neutral-900">
            {isReceived ? `제안 ${offer.quantity}` : `요청 ${offer.quantity}`} · {matchStatusLabel(offer.status)}
          </h3>
          <dl className="mt-4 space-y-3 text-xs leading-[18px]">
            <InfoRow label="기부 물품" value={offer.donationItemName} />
            <InfoRow label="필요 물품" value={offer.neededItemName} />
            <InfoRow label="최초 수량" value={offer.initialQuantity} />
          </dl>
        </section>

        <section className="mt-4">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold leading-[18px] text-primary-700">
            <MessageCircle aria-hidden size={16} strokeWidth={2} />
            {isReceived ? '기부자가 보낸 메시지' : '기관에서 보낸 메시지'}
          </h3>
          <p className="mt-2 rounded-control bg-primary-100 p-4 text-sm font-medium leading-[22px] text-neutral-900">
            {offer.message}
          </p>
        </section>

        {isReceived ? (
          <>
            <p className="mt-4 text-xs font-normal leading-5 text-neutral-700">
              기부자가 물품을 전달하고 싶다는 제안이에요.
              <br />
              수락·채팅 시작만으로 예약·나눔이 확정되지 않아요.
            </p>
          </>
        ) : null}
      </main>

      <footer className="shrink-0 px-5 pb-4 pt-2">
        <MatchActions key={offer.matchId} match={offer} audience="ORGANIZATION" />
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
