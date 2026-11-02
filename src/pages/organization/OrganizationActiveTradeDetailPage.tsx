import { useState, type ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { ROUTES, routePath } from '@/routes/paths'
import {
  organizationTrades,
  type TradeAppointment,
} from './organizationTrades'

export function OrganizationActiveTradeDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { tradeId } = useParams()
  const trade =
    organizationTrades.find((item) => item.id === tradeId) ?? organizationTrades[0]
  const [cancelOpen, setCancelOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [itemName, quantity = '10개'] = splitItem(trade.itemName)
  const isReserved = trade.badge === '예약중'
  const appointment = (location.state as { appointment?: TradeAppointment } | null)
    ?.appointment

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
          {isReserved ? '예약중' : '거래중'}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-3">
        <section className="rounded-card border border-neutral-200 bg-white p-4">
          <h2 className="text-base font-semibold leading-6 text-neutral-900">
            {trade.donorName} 님 · {trade.itemName}
          </h2>
          <p className="mt-3 text-xs font-semibold leading-[18px] text-primary-700">
            거래중 → 예약중 → 전달 완료
          </p>
          {isReserved ? (
            <>
              <p className="mt-3 text-xs font-normal leading-[18px] text-neutral-700">
                기부자가 협의한 {quantity}를 예약했어요.
              </p>
              <button
                type="button"
                onClick={() => setCompleteOpen(true)}
                className="mt-4 h-10 w-full rounded-control border-2 border-primary-600 bg-white text-xs font-bold text-primary-700 shadow-sm"
              >
                전달 완료
              </button>
            </>
          ) : null}
        </section>

        <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold leading-6 text-neutral-900">
              {trade.itemName}
            </h2>
            {!isReserved ? (
              <button
                type="button"
                onClick={() =>
                  navigate(routePath.organizationTradeQuantityEdit(trade.id))
                }
                className="h-9 rounded-pill border border-primary-200 bg-white px-4 text-xs font-semibold text-primary-700"
              >
                수량 변경
              </button>
            ) : null}
          </div>
          <dl className="mt-4 space-y-3 text-xs leading-[18px]">
            <InfoRow
              label="품목 · 수량"
              value={`${itemName} · ${isReserved ? '예약' : '협의'} 수량 ${quantity}`}
            />
            <InfoRow label="물품 상태" value="중 · 처음 상태와 유사" />
            <InfoRow label="물품 위치" value="경기도 부천시" />
          </dl>
        </section>

        {isReserved ? (
          <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
            <h2 className="text-base font-semibold leading-6 text-neutral-900">
              전달 약속
            </h2>
            {appointment ? (
              <>
                <div className="mt-3 space-y-1 text-xs font-normal leading-[18px] text-neutral-700">
                  <p>{appointment.dateTime}</p>
                  <p>{appointment.location}</p>
                  <p>{appointment.method}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigate(routePath.organizationTradeAppointment(trade.id), {
                      state: { appointment },
                    })
                  }
                  className="mt-4 h-10 w-full rounded-control border border-primary-400 bg-primary-100 text-xs font-bold text-primary-700 shadow-sm"
                >
                  전달 약속 수정
                </button>
              </>
            ) : (
              <>
                <p className="mt-3 text-xs font-normal leading-[18px] text-neutral-700">
                  아직 저장한 약속이 없어요.
                  <br />
                  날짜·장소·전달 방법을 함께 정해 주세요.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigate(routePath.organizationTradeAppointment(trade.id))
                  }
                  className="mt-4 h-10 w-full rounded-control border border-neutral-200 bg-white text-xs font-semibold text-primary-700"
                >
                  약속 입력
                </button>
              </>
            )}
          </section>
        ) : (
          <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
            <dl className="space-y-3 text-xs leading-[18px]">
              <InfoRow label="기부자" value={`${trade.donorName} 님`} />
              <InfoRow label="기관 주소" value="경기도 부천시 가마안로 12" />
              <InfoRow label="전달 방법" value="직접 전달 · 채팅에서 협의" />
              <InfoRow label="전달 일정" value="채팅에서 조율 중" />
            </dl>
          </section>
        )}
      </main>

      <footer className="grid shrink-0 grid-cols-2 gap-3 px-5 pb-4 pt-2">
        <Button
          className="h-[46px]"
          onClick={() =>
            navigate(
              `${routePath.chatRoom('donor-choi-yoonseo')}?audience=organization`,
            )
          }
        >
          채팅
        </Button>
        <Button
          variant="secondary"
          className="h-[46px]"
          onClick={() => setCancelOpen(true)}
        >
          거래 취소
        </Button>
      </footer>

      <Dialog
        open={cancelOpen}
        title="거래를 취소할까요?"
        description="취소한 거래는 다시 진행할 수 없어요."
        confirmText="거래 취소"
        cancelText="계속 진행"
        confirmVariant="danger"
        onConfirm={() => navigate(ROUTES.organization.tradeStatus)}
        onCancel={() => setCancelOpen(false)}
      />
      <Dialog
        open={completeOpen}
        title="전달을 완료했나요?"
        description="완료 처리하면 전달 완료 내역에서 확인할 수 있어요."
        confirmText="전달 완료"
        cancelText="아직이에요"
        onConfirm={() => navigate(ROUTES.organization.tradeStatus)}
        onCancel={() => setCompleteOpen(false)}
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

function splitItem(itemName: string) {
  const match = itemName.match(/^(.+?)\s+(\d+(?:개|권|벌|세트))$/)
  return match ? [match[1], match[2]] : [itemName, '10개']
}
