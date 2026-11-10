import {
  ChevronLeft,
} from 'lucide-react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import { Button } from '@/components/common/Button/Button'
import { TransactionStatus } from '@/components/common/TransactionStatus/TransactionStatus'

import {
  ROUTES,
  routePath,
} from '@/routes/paths'

import {
  useMatchQuery,
} from '@/hooks/queries/useMatchQuery'

import {
  matchErrorMessage,
  parseMatchId,
} from '@/apis/match'

import {
  MatchActions,
  matchStatusLabel,
} from '@/features/matches/MatchActions'

import {
  getAuthSession,
} from '@/features/auth/storage'

export function DonorRequestDetailPage() {
  const navigate =
    useNavigate()

  const {
    requestId,
  } = useParams()

  const authenticatedRole =
    getAuthSession()?.role ??
    null

  const id =
    parseMatchId(
      requestId,
    )

  const query =
    useMatchQuery(id)

  const request =
    query.data

  if (
    id === null ||
    query.isPending ||
    query.isError ||
    !request
  ) {
    return (
      <div className="min-h-dvh bg-surface-canvas p-5">
        <h1 className="typography-title-3">
          요청 상세
        </h1>

        <p
          role={
            query.isError
              ? 'alert'
              : 'status'
          }
          className="mt-4"
        >
          {id === null
            ? '올바른 매칭 번호가 필요해요.'
            : query.isError
              ? matchErrorMessage(
                  query.error,
                )
              : query.isPending
                ? '불러오는 중이에요.'
                : '매칭 정보를 찾을 수 없어요.'}
        </p>

        {query.isError ? (
          <Button
            className="mt-4"
            onClick={() =>
              void query.refetch()
            }
          >
            다시 시도
          </Button>
        ) : null}

        <Button
          variant="secondary"
          className="mt-2"
          onClick={() =>
            navigate(
              ROUTES.donor
                .myRequests,
            )
          }
        >
          목록으로
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() =>
            navigate(-1)
          }
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft
            aria-hidden
            size={24}
            strokeWidth={2}
          />
        </button>

        <h1 className="typography-title-3 text-neutral-900">
          요청 상세
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="typography-heading-2 text-neutral-900">
              {
                request.donationItemName
              }
            </h2>

            <p className="mt-2 typography-body-2 text-neutral-700">
              {
                request.neededItemName
              }
            </p>
          </div>

          <TransactionStatus
            variant={
              request.status ===
              'RESERVED'
                ? 'reserved'
                : 'trading'
            }
            className="shrink-0"
          >
            {matchStatusLabel(
              request.status,
            )}
          </TransactionStatus>
        </div>

        <section className="mt-5 rounded-card border border-neutral-200 bg-white p-4">
          <dl className="space-y-2 typography-body-2">
            <InfoRow
              label="연결 물품"
              value={
                request.donationItemName
              }
            />

            <InfoRow
              label="신청 수량"
              value={`${request.quantity}${request.unit}`}
            />

            <InfoRow
              label="최초 신청 수량"
              value={`${request.initialQuantity}${request.unit}`}
            />

            <InfoRow
              label="남은 수량"
              value={`${request.donationItemRemainingQuantity}${request.unit}`}
            />

            <InfoRow
              label="추가 필요 수량"
              value={`${request.neededItemAdditionalQuantity}${request.unit}`}
            />

            <InfoRow
              label="기부자"
              value={
                request.donorName
              }
            />

            <InfoRow
              label="기관"
              value={
                request.organizationName
              }
            />

            <InfoRow
              label="기관 주소"
              value={
                request.organizationAddress
              }
            />

            <InfoRow
              label="수령 주소"
              value={
                request.neededItemReceiveAddress
              }
            />

            <InfoRow
              label="물품 분류"
              value={
                request.itemCategoryName
              }
            />

            <InfoRow
              label="물품 상태"
              value={
                request.conditionGrade
              }
            />

            <InfoRow
              label="물품 지역"
              value={
                request.donationItemRegion
              }
            />

            <InfoRow
              label="기관 지역"
              value={
                request.neededItemRegion
              }
            />

            {request.chatRoomId !==
            null ? (
              <InfoRow
                label="채팅방 번호"
                value={String(
                  request.chatRoomId,
                )}
              />
            ) : null}
          </dl>
        </section>

        <section className="mt-5">
          <h3 className="typography-title-2 text-neutral-900">
            요청 내용
          </h3>

          <p className="mt-3 whitespace-pre-wrap typography-body-1 text-neutral-900">
            {request.message}
          </p>
        </section>
      </main>

      <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-neutral-200 bg-surface-canvas px-5 py-4">
        <Button
          variant="secondary"
          onClick={() =>
            navigate(-1)
          }
        >
          닫기
        </Button>

        <MatchActions
          key={
            request.matchId
          }
          match={request}
          audience="DONOR"
          authenticatedRole={
            authenticatedRole
          }
        />

        {request.status ===
          'TRADING' ||
        request.status ===
          'RESERVED' ? (
          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                routePath.tradeDetail(
                  String(
                    request.matchId,
                  ),
                ),
              )
            }
          >
            거래 상세
          </Button>
        ) : null}
      </footer>
    </div>
  )
}

type InfoRowProps = {
  label: string
  value: string
}

function InfoRow({
  label,
  value,
}: InfoRowProps) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2">
      <dt className="text-neutral-700">
        {label}
      </dt>

      <dd className="break-words text-neutral-900">
        {value}
      </dd>
    </div>
  )
}