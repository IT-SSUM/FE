import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import { matchErrorMessage, parseMatchId } from '@/apis/match'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { Input } from '@/components/common/Input/Input'
import { getAuthSession } from '@/features/auth/storage'
import { conditionLabel } from '@/features/donor/donationItemApiState'
import { useCancelMatchMutation } from '@/hooks/mutations/useCancelMatchMutation'
import { useReserveMatchMutation } from '@/hooks/mutations/useReserveMatchMutation'
import { useMatchQuery } from '@/hooks/queries/useMatchQuery'
import { ROUTES, routePath } from '@/routes/paths'

export function TradeDetailPage() {
  const navigate = useNavigate()
  const { tradeId } = useParams()
  const id = parseMatchId(tradeId)
  const query = useMatchQuery(id)

  const reserveMutation = useReserveMatchMutation()
  const cancelMutation = useCancelMatchMutation()

  const role = getAuthSession()?.role ?? null

  const [reserveOpen, setReserveOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [error, setError] = useState('')

  if (
    id === null ||
    query.isPending ||
    query.isError ||
    !query.data
  ) {
    return (
      <div className="min-h-dvh bg-surface-canvas p-5">
        <h1 className="typography-title-3 text-neutral-900">
          거래 상세
        </h1>

        <p
          role={query.isError ? 'alert' : 'status'}
          className="mt-4 typography-body-2 text-neutral-700"
        >
          {id === null
            ? '올바른 매칭 번호가 필요해요.'
            : query.isError
              ? matchErrorMessage(query.error)
              : query.isPending
                ? '불러오는 중이에요.'
                : '거래 정보를 찾을 수 없어요.'}
        </p>

        {query.isError ? (
          <Button
            className="mt-4"
            onClick={() => void query.refetch()}
          >
            다시 시도
          </Button>
        ) : null}

        <Button
          variant="secondary"
          className="mt-2"
          onClick={() => navigate(-1)}
        >
          뒤로가기
        </Button>
      </div>
    )
  }

  const trade = query.data

  const trading = trade.status === 'TRADING'
  const reserved = trade.status === 'RESERVED'

  const canReserve =
    trading &&
    role === 'DONOR'

  const canChangeQuantity =
    trading &&
    role === 'DONOR'

  const canEditAppointment =
    reserved &&
    role === 'DONOR'

  const canCancel =
    trading || reserved

  const hasAppointment =
    Boolean(
      trade.scheduledAt &&
      trade.deliveryPlace,
    )

  const openChat = () => {
    if (trade.chatRoomId !== null) {
      navigate(
        routePath.chatRoom(
          String(trade.chatRoomId),
        ),
      )
    }
  }

  const handleReserve = async () => {
    if (
      !canReserve ||
      reserveMutation.isPending
    ) {
      return
    }

    setError('')

    try {
      await reserveMutation.mutateAsync(trade.matchId)
      setReserveOpen(false)
    } catch (cause) {
      setError(matchErrorMessage(cause))
    }
  }

  const handleCancel = async () => {
    if (
      !canCancel ||
      cancelMutation.isPending ||
      !cancelReason.trim()
    ) {
      return
    }

    setError('')

    try {
      await cancelMutation.mutateAsync({
        matchId: trade.matchId,
        body: {
          reason: cancelReason.trim(),
        },
      })

      navigate(
        role === 'DONOR'
          ? ROUTES.donor.myHistory
          : ROUTES.organization.tradeStatus,
        { replace: true },
      )
    } catch (cause) {
      setError(matchErrorMessage(cause))
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>

        <h1 className="typography-title-3 text-neutral-900">
          {reserved ? '예약중' : '거래 상세'}
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-3">
        <section className="rounded-card border border-neutral-200 bg-white p-4">
          <h2 className="typography-title-2 text-neutral-900">
            {trade.organizationName} ·{' '}
            {trade.donationItemName}{' '}
            {trade.quantity}{trade.unit}
          </h2>

          <p className="mt-3 typography-label-2 text-primary-700">
            거래중 → 예약중 → 전달 완료
          </p>

          {trading ? (
            <>
              <div className="mt-4 space-y-1 typography-label-2 leading-5 text-neutral-700">
                <p>거래중에는 수량을 확보하지 않아요.</p>
                <p>예약중 변경은 기부자만 가능해요.</p>
                <p>취소는 양측 모두 가능해요.</p>
              </div>

              {canReserve ? (
                <Button
                  variant="secondary"
                  className="mt-4 w-full border-primary-700"
                  onClick={() => {
                    setError('')
                    setReserveOpen(true)
                  }}
                >
                  예약중으로 변경
                </Button>
              ) : null}
            </>
          ) : null}
        </section>

        <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="typography-title-2 text-neutral-900">
              {trade.donationItemName}{' '}
              {trade.quantity}{trade.unit}
            </h2>

            {canChangeQuantity ? (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    routePath.tradeQuantityEdit(
                      String(trade.matchId),
                    ),
                  )
                }
                className="shrink-0 rounded-pill border border-neutral-200 bg-white px-3 py-2 typography-label-2 text-primary-700"
              >
                수량 변경
              </button>
            ) : null}
          </div>

          <dl className="mt-4 space-y-3">
            <InfoRow
              label="품목 · 수량"
              value={`${trade.donationItemName} · ${
                reserved ? '예약' : '협의'
              } 수량 ${trade.quantity}${trade.unit}`}
            />

            <InfoRow
              label="물품 상태"
              value={conditionText(trade.conditionGrade)}
            />

            <InfoRow
              label="물품 위치"
              value={trade.donationItemRegion}
            />
          </dl>
        </section>

        {trading ? (
          <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
            <dl className="space-y-3">
              <InfoRow
                label="수령 기관"
                value={trade.organizationName}
              />

              <InfoRow
                label="기관 주소"
                value={trade.organizationAddress}
              />

              <InfoRow
                label="전달 방법"
                value={
                  trade.deliveryMethod
                    ? `${deliveryMethodLabel(
                        trade.deliveryMethod,
                      )} · 채팅에서 협의`
                    : '직접 전달 · 채팅에서 협의'
                }
              />

              <InfoRow
                label="전달 일정"
                value={
                  trade.scheduledAt
                    ? formatAppointmentDate(trade.scheduledAt)
                    : '채팅에서 조율 중'
                }
              />
            </dl>
          </section>
        ) : null}

        {reserved ? (
          <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
            <h2 className="typography-title-2 text-neutral-900">
              전달 약속
            </h2>

            {hasAppointment ? (
              <>
                <div className="mt-3 space-y-1 typography-body-2 text-neutral-700">
                  <p>
                    {formatAppointmentDate(trade.scheduledAt)}
                  </p>

                  <p>
                    {formatDeliveryPlace(trade.deliveryPlace)}
                  </p>

                  <p>
                    {deliveryMethodLabel(trade.deliveryMethod)}
                  </p>
                </div>

                {canEditAppointment ? (
                  <Button
                    variant="secondary"
                    className="mt-4 w-full"
                    onClick={() =>
                      navigate(
                        routePath.tradeAppointment(
                          String(trade.matchId),
                        ),
                      )
                    }
                  >
                    약속 수정
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                <p className="mt-3 typography-body-2 leading-5 text-neutral-700">
                  아직 저장한 약속이 없어요.
                  <br />
                  날짜·장소·전달 방법을 함께 정해 주세요.
                </p>

                {canEditAppointment ? (
                  <Button
                    variant="secondary"
                    className="mt-4 w-full"
                    onClick={() =>
                      navigate(
                        routePath.tradeAppointment(
                          String(trade.matchId),
                        ),
                      )
                    }
                  >
                    약속 입력
                  </Button>
                ) : null}
              </>
            )}
          </section>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-4 typography-label-2 text-error"
          >
            {error}
          </p>
        ) : null}
      </main>

      {canCancel ? (
        <footer className="grid shrink-0 grid-cols-2 gap-2 bg-surface-canvas px-5 pb-5 pt-3">
          <Button
            disabled={trade.chatRoomId === null}
            onClick={openChat}
          >
            채팅
          </Button>

          <Button
            variant="secondary"
            disabled={cancelMutation.isPending}
            onClick={() => {
              setError('')
              setCancelReason('')
              setCancelOpen(true)
            }}
          >
            거래 취소
          </Button>
        </footer>
      ) : null}

      <Dialog
        open={reserveOpen}
        title="예약중으로 변경할까요?"
        description={`${trade.quantity}${trade.unit}를 임시 예약해요.\n최종 확정은 기관의 전달 완료 처리 후예요.`}
        confirmText={
          reserveMutation.isPending
            ? '변경 중...'
            : '변경하기'
        }
        cancelText="취소"
        confirmDisabled={reserveMutation.isPending}
        cancelDisabled={reserveMutation.isPending}
        className="text-center [&>p]:whitespace-pre-line"
        onConfirm={() => void handleReserve()}
        onCancel={() => {
          if (!reserveMutation.isPending) {
            setReserveOpen(false)
          }
        }}
      />

      {cancelOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <section className="w-full max-w-[332px] rounded-control bg-white p-6 shadow-xl">
            <h2 className="typography-title-1 text-neutral-900">
              거래를 취소할까요?
            </h2>

            <p className="mt-2 typography-body-2 text-neutral-700">
              취소 사유를 입력해 주세요.
            </p>

            <div className="mt-5">
              <Input
                label="취소 사유"
                value={cancelReason}
                disabled={cancelMutation.isPending}
                placeholder="취소 사유를 입력해 주세요"
                onChange={(event) =>
                  setCancelReason(event.target.value)
                }
              />
            </div>

            <div className="mt-6 space-y-2">
              <Button
                variant="danger"
                className="w-full"
                disabled={
                  cancelMutation.isPending ||
                  !cancelReason.trim()
                }
                onClick={() => void handleCancel()}
              >
                {cancelMutation.isPending
                  ? '취소 중...'
                  : '거래 취소'}
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                disabled={cancelMutation.isPending}
                onClick={() => setCancelOpen(false)}
              >
                닫기
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-3 typography-body-2">
      <dt className="text-neutral-700">{label}</dt>
      <dd className="min-w-0 break-words text-neutral-900">
        {value}
      </dd>
    </div>
  )
}

function conditionText(value: string) {
  return (
    conditionLabel[
      value as keyof typeof conditionLabel
    ] ?? value
  )
}

function deliveryMethodLabel(value: string | null) {
  if (!value || value === 'DIRECT') {
    return '직접 전달'
  }

  return value
}

function formatDeliveryPlace(value: string | null) {
  if (!value) return '미정'

  return value.replace(/,\s*/g, ' · ')
}

function formatAppointmentDate(value: string | null) {
  if (!value) return '미정'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const parts = new Intl.DateTimeFormat(
    'ko-KR',
    {
      timeZone: 'Asia/Seoul',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
  ).formatToParts(date)

  const part = (
    type: Intl.DateTimeFormatPartTypes,
  ) =>
    parts.find((item) => item.type === type)?.value ?? ''

  const minute = part('minute')

  return `${part('month')} ${part('day')} (${part('weekday')}) ${part('dayPeriod')} ${part('hour')}시${
    minute === '00' ? '' : ` ${minute}분`
  }`
}