import { useState, type ReactNode } from 'react'
import { ChevronLeft, MessageCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { ROUTES, routePath } from '@/routes/paths'
import { organizationOffers } from './organizationOffers'

export function OfferDetailPage() {
  const navigate = useNavigate()
  const { offerId } = useParams()
  const offer =
    organizationOffers.find((item) => item.id === offerId) ?? organizationOffers[0]
  const [rejectOpen, setRejectOpen] = useState(false)
  const isReceived = offer.direction === 'received'

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
            ? `${offer.donorName} 님의 기부 제안`
            : `${offer.donorName} 님에게 보낸 요청`}
        </h2>

        <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
          <h3 className="text-base font-semibold leading-6 text-neutral-900">
            {isReceived ? `제안 ${offer.quantity}` : `요청 ${offer.quantity}`} · 추가 필요 수량 {offer.availableQuantity}
          </h3>
          <dl className="mt-4 space-y-3 text-xs leading-[18px]">
            <InfoRow label="물품 상태" value={offer.condition} />
            <InfoRow label="기부자" value={`${offer.donorName} 님`} />
            <InfoRow label="물품 위치" value={offer.location} />
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
            <Button
              variant="secondary"
              className="mt-4 h-[50px] w-full border-primary-400 font-semibold"
              onClick={() => setRejectOpen(true)}
            >
              거절
            </Button>
            <p className="mt-4 text-xs font-normal leading-5 text-neutral-700">
              기부자가 물품을 전달하고 싶다는 제안이에요.
              <br />
              수락·채팅 시작만으로 예약·나눔이 확정되지 않아요.
            </p>
          </>
        ) : null}
      </main>

      {isReceived ? (
        <footer className="shrink-0 px-5 pb-4 pt-2">
          <Button
            className="h-[46px] w-full"
            onClick={() =>
              navigate(
                `${routePath.chatRoom('donor-choi-yoonseo')}?audience=organization`,
              )
            }
          >
            수락하기
          </Button>
        </footer>
      ) : null}

      <Dialog
        open={rejectOpen}
        title="제안을 거절할까요?"
        description="거절한 제안은 목록에서 확인할 수 없어요."
        confirmText="거절하기"
        cancelText="계속 확인"
        confirmVariant="danger"
        onConfirm={() => navigate(ROUTES.organization.offerList)}
        onCancel={() => setRejectOpen(false)}
      />
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
