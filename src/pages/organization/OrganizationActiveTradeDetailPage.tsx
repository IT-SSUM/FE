import {
  useState,
  type ReactNode,
} from 'react'

import {
  ChevronLeft,
} from 'lucide-react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  matchErrorMessage,
  parseMatchId,
} from '@/apis/match'

import {
  Button,
} from '@/components/common/Button/Button'

import {
  Input,
} from '@/components/common/Input/Input'

import {
  getAuthSession,
} from '@/features/auth/storage'

import {
  MatchActions,
  matchStatusLabel,
} from '@/features/matches/MatchActions'

import {
  useCancelMatchMutation,
} from '@/hooks/mutations/useCancelMatchMutation'

import {
  useCompleteMatchMutation,
} from '@/hooks/mutations/useCompleteMatchMutation'

import {
  useMatchQuery,
} from '@/hooks/queries/useMatchQuery'

import {
  ROUTES,
  routePath,
} from '@/routes/paths'

const conditionLabels:
  Record<string, string> = {
    HIGH:
      '상 · 미개봉',

    MID:
      '중 · 처음 상태와 유사',

    LOW:
      '하 · 사용감 많음',
  }

export function OrganizationActiveTradeDetailPage({
  authenticatedRole = null,
}: {
  authenticatedRole?:
    | 'DONOR'
    | 'ORGANIZATION'
    | null
}) {
  const navigate =
    useNavigate()

  const {
    tradeId,
  } =
    useParams()

  const id =
    parseMatchId(
      tradeId,
    )

  const query =
    useMatchQuery(
      id,
    )

  const trade =
    query.data

  const role =
    authenticatedRole ??
    getAuthSession()?.role ??
    null

  const completeMutation =
    useCompleteMatchMutation()

  const cancelMutation =
    useCancelMatchMutation()

  const [
    completeOpen,
    setCompleteOpen,
  ] =
    useState(false)

  const [
    cancelOpen,
    setCancelOpen,
  ] =
    useState(false)

  const [
    cancelReason,
    setCancelReason,
  ] =
    useState('')

  const [
    actionError,
    setActionError,
  ] =
    useState('')

  const isReserved =
    trade?.status ===
    'RESERVED'

  const canComplete =
    isReserved &&
    role ===
      'ORGANIZATION'

  const canCancel =
    Boolean(
      trade &&
        (
          trade.status ===
            'TRADING' ||
          trade.status ===
            'RESERVED'
        ) &&
        role ===
          'ORGANIZATION',
    )

  const hasAppointment =
    Boolean(
      trade?.scheduledAt &&
      (
        trade.deliveryPlace ||
        trade.neededItemReceiveAddress
      ),
    )

  const openChat =
    () => {
      if (
        !trade ||
        trade.chatRoomId ===
          null
      ) {
        return
      }

      navigate(
        routePath.chatRoom(
          String(
            trade.chatRoomId,
          ),
        ),
      )
    }

  const openAppointment =
    () => {
      if (!trade) {
        return
      }

      navigate(
        routePath.organizationTradeAppointment(
          String(
            trade.matchId,
          ),
        ),
      )
    }

  const handleComplete =
    async () => {
      if (
        !trade ||
        !canComplete ||
        completeMutation.isPending
      ) {
        return
      }

      setActionError('')

      try {
        await completeMutation.mutateAsync(
          trade.matchId,
        )

        setCompleteOpen(
          false,
        )

        navigate(
          `${ROUTES.organization.tradeStatus}?status=complete`,
          {
            replace:
              true,
          },
        )
      } catch (
        cause
      ) {
        setActionError(
          matchErrorMessage(
            cause,
          ),
        )
      }
    }

  const handleCancel =
    async () => {
      if (
        !trade ||
        !canCancel ||
        cancelMutation.isPending
      ) {
        return
      }

      const reason =
        cancelReason.trim()

      if (!reason) {
        setActionError(
          '취소 사유를 입력해 주세요.',
        )

        return
      }

      setActionError('')

      try {
        await cancelMutation.mutateAsync(
          {
            matchId:
              trade.matchId,

            body: {
              reason,
            },
          },
        )

        setCancelOpen(
          false,
        )

        navigate(
          `${ROUTES.organization.tradeStatus}?status=canceled`,
          {
            replace:
              true,
          },
        )
      } catch (
        cause
      ) {
        setActionError(
          matchErrorMessage(
            cause,
          ),
        )
      }
    }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() =>
            navigate(-1)
          }
          className="flex size-6 items-center justify-center text-primary-700"
        >
          <ChevronLeft
            aria-hidden
            size={24}
            strokeWidth={2}
          />
        </button>

        <h1 className="typography-title-3 text-neutral-900">
          {isReserved
            ? '개별 거래 · 예약중'
            : trade
              ? matchStatusLabel(
                  trade.status,
                )
              : '거래 상세'}
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2">
        {id === null ? (
          <p
            role="alert"
            className="py-12 text-center typography-body-2 text-error"
          >
            올바른 매칭 번호가 필요해요.
          </p>
        ) : query.isPending ? (
          <p
            role="status"
            className="py-12 text-center typography-body-2 text-neutral-700"
          >
            거래 상세 정보를 불러오는 중이에요.
          </p>
        ) : query.isError ? (
          <div
            role="alert"
            className="py-12 text-center"
          >
            <p className="typography-body-2 text-error">
              {matchErrorMessage(
                query.error,
              )}
            </p>

            <Button
              variant="secondary"
              className="mt-4 h-10"
              onClick={() =>
                void query.refetch()
              }
            >
              다시 시도
            </Button>
          </div>
        ) : trade &&
          isReserved ? (
          <div className="space-y-4">

            {/* 1. 나눔 진행 단계 */}
            <section className="rounded-card border border-neutral-200 bg-white p-4">
              <h2 className="text-base font-semibold leading-[26px] text-neutral-900">
                {
                  trade.donorName
                }{' '}
                님 ·{' '}
                {
                  trade.donationItemName
                }{' '}
                {
                  trade.quantity
                }
                {
                  trade.unit
                }
              </h2>

              <p className="mt-3 text-xs font-semibold leading-[18px] text-primary-700">
                거래중 → 예약중 → 전달 완료
              </p>

              <p className="mt-3 text-xs font-normal leading-[18px] text-neutral-700">
                기부자가 수량을 임시 예약했어요.
                <br />
                기관이 실제 수령 후 전달 완료로 처리해요.
              </p>

              {canComplete ? (
                <Button
                  variant="secondary"
                  className="mt-3 w-full border-primary-700"
                  disabled={
                    completeMutation.isPending
                  }
                  onClick={() => {
                    setActionError(
                      '',
                    )

                    setCompleteOpen(
                      true,
                    )
                  }}
                >
                  전달 완료 처리
                </Button>
              ) : null}
            </section>

            {/* 2. 물품 요약 */}
            <section className="rounded-card border border-neutral-200 bg-white p-4">
              <h2 className="text-base font-semibold leading-[26px] text-neutral-900">
                {
                  trade.donationItemName
                }{' '}
                {
                  trade.quantity
                }
                {
                  trade.unit
                }
              </h2>

              <dl className="mt-4 space-y-3">
                <InfoRow
                  label="품목 · 수량"
                  value={`${trade.donationItemName} · 예약 수량 ${trade.quantity}${trade.unit}`}
                />

                <InfoRow
                  label="물품 상태"
                  value={
                    conditionLabels[
                      trade.conditionGrade
                    ] ??
                    trade.conditionGrade
                  }
                />

                <InfoRow
                  label="물품 위치"
                  value={
                    trade.donationItemRegion
                  }
                />
              </dl>
            </section>

            {/* 3. 전달 약속 */}
            <section className="rounded-card border border-neutral-200 bg-white p-4">
              {hasAppointment ? (
                <>
                  <dl className="space-y-3">
                    <InfoRow
                      label="기부자"
                      value={`${trade.donorName} 님`}
                    />

                    <InfoRow
                      label="수령 장소"
                      value={
                        trade.deliveryPlace ||
                        trade.neededItemReceiveAddress ||
                        '아직 정하지 않았어요.'
                      }
                    />

                    <InfoRow
                      label="전달 방법"
                      value={formatDeliveryMethod(
                        trade.deliveryMethod,
                      )}
                    />

                    <InfoRow
                      label="전달 일정"
                      value={formatDateTime(
                        trade.scheduledAt,
                      )}
                    />
                  </dl>

                  <Button
                    variant="secondary"
                    className="mt-4 w-full"
                    onClick={
                      openAppointment
                    }
                  >
                    전달 약속 수정
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-base font-semibold leading-[26px] text-neutral-900">
                    전달 약속
                  </h2>

                  <p className="mt-3 text-xs font-normal leading-[18px] text-neutral-700">
                    아직 저장한 약속이 없어요.
                    <br />
                    날짜·장소·전달 방법을 함께 정해 주세요.
                  </p>

                  <Button
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={
                      openAppointment
                    }
                  >
                    약속 입력
                  </Button>
                </>
              )}
            </section>

            {actionError ? (
              <p
                role="alert"
                className="typography-label-2 text-error"
              >
                {
                  actionError
                }
              </p>
            ) : null}
          </div>
        ) : trade ? (
          /*
           * 예약중 이외 상태는 기존 MatchActions를 유지.
           * 전달 완료/거래중 등의 기존 동작을 깨지 않기 위함.
           */
          <section className="rounded-card border border-neutral-200 bg-white p-4">
            <h2 className="typography-title-2 text-neutral-900">
              {
                trade.donorName
              }{' '}
              님 ·{' '}
              {
                trade.donationItemName
              }{' '}
              {
                trade.quantity
              }
              {
                trade.unit
              }
            </h2>

            <p className="mt-3 typography-label-2 text-primary-700">
              거래중 → 예약중 → 전달 완료
            </p>

            <div className="mt-4">
              <MatchActions
                match={
                  trade
                }
                audience="ORGANIZATION"
                authenticatedRole={
                  role
                }
              />
            </div>
          </section>
        ) : (
          <p
            role="status"
            className="py-12 text-center typography-body-2 text-neutral-700"
          >
            거래 정보를 찾을 수 없어요.
          </p>
        )}
      </main>

      {/* Figma 하단 버튼 */}
      {trade &&
      isReserved &&
      role ===
        'ORGANIZATION' ? (
        <footer className="shrink-0 bg-surface-canvas px-5 pb-5 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="w-full"
              disabled={
                trade.chatRoomId ===
                null
              }
              onClick={
                openChat
              }
            >
              채팅
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              disabled={
                cancelMutation.isPending
              }
              onClick={() => {
                setActionError(
                  '',
                )

                setCancelReason(
                  '',
                )

                setCancelOpen(
                  true,
                )
              }}
            >
              거래 취소
            </Button>
          </div>
        </footer>
      ) : null}

      {/* 전달 완료 모달 */}
      {completeOpen &&
      trade ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.28] px-5"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="complete-dialog-title"
            className="w-full max-w-[343px] rounded-[22px] bg-white p-5 shadow-xl"
          >
            <h2
              id="complete-dialog-title"
              className="text-center text-[18px] font-bold leading-[26px] text-neutral-900"
            >
              {
                trade.donationItemName
              }{' '}
              {
                trade.quantity
              }
              {
                trade.unit
              }
              를 받으셨나요?
            </h2>

            <p className="mt-2 text-center text-xs font-normal leading-[18px] text-neutral-700">
              기관이 실제 수령한{' '}
              {
                trade.quantity
              }
              {
                trade.unit
              }
              를 확인하면 기부가 완료돼요.
            </p>

            {actionError ? (
              <p
                role="alert"
                className="mt-2 text-center text-xs text-error"
              >
                {
                  actionError
                }
              </p>
            ) : null}

            <div className="mt-2 flex flex-col gap-2">
              <Button
                className="w-full"
                disabled={
                  completeMutation.isPending
                }
                onClick={() =>
                  void handleComplete()
                }
              >
                {completeMutation.isPending
                  ? '처리 중...'
                  : '전달 완료'}
              </Button>

              <Button
                variant="secondary"
                className="w-full border-neutral-400"
                disabled={
                  completeMutation.isPending
                }
                onClick={() => {
                  setCompleteOpen(
                    false,
                  )

                  setActionError(
                    '',
                  )
                }}
              >
                취소
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      {/* 거래 취소 모달 */}
      {cancelOpen &&
      trade ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.28] px-5"
        >
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[343px] rounded-[22px] bg-white p-5 shadow-xl"
          >
            <h2 className="text-center text-[18px] font-bold leading-[26px] text-neutral-900">
              거래를 취소할까요?
            </h2>

            <p className="mt-2 text-center typography-body-2 text-neutral-700">
              취소 사유를 입력해 주세요.
            </p>

            <div className="mt-5">
              <Input
                label="취소 사유"
                value={
                  cancelReason
                }
                disabled={
                  cancelMutation.isPending
                }
                placeholder="취소 사유를 입력해 주세요"
                onChange={(
                  event,
                ) => {
                  setCancelReason(
                    event.target.value,
                  )

                  setActionError(
                    '',
                  )
                }}
              />
            </div>

            {actionError ? (
              <p
                role="alert"
                className="mt-2 text-center typography-label-2 text-error"
              >
                {
                  actionError
                }
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2">
              <Button
                variant="danger"
                className="w-full"
                disabled={
                  cancelMutation.isPending ||
                  !cancelReason.trim()
                }
                onClick={() =>
                  void handleCancel()
                }
              >
                {cancelMutation.isPending
                  ? '처리 중...'
                  : '거래 취소'}
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                disabled={
                  cancelMutation.isPending
                }
                onClick={() => {
                  setCancelOpen(
                    false,
                  )

                  setActionError(
                    '',
                  )
                }}
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
  label:
    string

  value:
    ReactNode
}) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2 text-xs leading-[22px]">
      <dt className="font-normal text-neutral-700">
        {label}
      </dt>

      <dd className="min-w-0 font-normal text-neutral-900">
        {value}
      </dd>
    </div>
  )
}

function formatDeliveryMethod(
  method:
    string | null,
) {
  if (
    method ===
    'DIRECT'
  ) {
    return '직접 전달 · 채팅에서 협의'
  }

  if (
    method ===
    'PARCEL'
  ) {
    return '택배 전달 · 채팅에서 협의'
  }

  return '채팅에서 협의'
}

function formatDateTime(
  value:
    string | null,
) {
  if (!value) {
    return '아직 정하지 않았어요.'
  }

  const date =
    new Date(
      value,
    )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '아직 정하지 않았어요.'
  }

  const parts =
    new Intl.DateTimeFormat(
      'ko-KR',
      {
        timeZone:
          'Asia/Seoul',

        month:
          'long',

        day:
          'numeric',

        hour:
          'numeric',

        minute:
          '2-digit',

        hour12:
          true,
      },
    ).formatToParts(
      date,
    )

  const getPart =
    (
      type:
        Intl.DateTimeFormatPartTypes,
    ) =>
      parts.find(
        (item) =>
          item.type ===
          type,
      )?.value ??
      ''

  const minute =
    getPart(
      'minute',
    )

  return `${getPart('month')} ${getPart('day')} ${getPart('dayPeriod')} ${getPart('hour')}시${
    minute ===
    '00'
      ? ''
      : ` ${minute}분`
  }`
}