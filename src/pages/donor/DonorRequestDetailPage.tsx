import { ChevronLeft, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import { matchErrorMessage, parseMatchId } from '@/apis/match'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { Toast } from '@/components/common/Toast/Toast'
import { TransactionStatus } from '@/components/common/TransactionStatus/TransactionStatus'
import { getAuthSession } from '@/features/auth/storage'
import { conditionLabel } from '@/features/donor/donationItemApiState'
import {
  MatchActions,
  matchDirection,
  matchStatusLabel,
} from '@/features/matches/MatchActions'
import { useAcceptMatchMutation } from '@/hooks/mutations/useAcceptMatchMutation'
import { useRejectMatchMutation } from '@/hooks/mutations/useRejectMatchMutation'
import { useMatchQuery } from '@/hooks/queries/useMatchQuery'
import { ROUTES, routePath } from '@/routes/paths'

export function DonorRequestDetailPage() {
  const navigate = useNavigate()
  const { requestId } = useParams()
  const authenticatedRole = getAuthSession()?.role ?? null
  const id = parseMatchId(requestId)
  const query = useMatchQuery(id)

  const accept = useAcceptMatchMutation()
  const reject = useRejectMatchMutation()

  const [rejectOpen, setRejectOpen] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<{
    title: string
    description?: string
  } | null>(null)

  const request = query.data

  if (
    id === null ||
    query.isPending ||
    query.isError ||
    !request
  ) {
    return (
      <div className="min-h-dvh bg-surface-canvas p-5">
        <h1 className="typography-title-3">
          기부 요청 · 응답
        </h1>

        <p
          role={query.isError ? 'alert' : 'status'}
          className="mt-4"
        >
          {id === null
            ? '올바른 매칭 번호가 필요해요.'
            : query.isError
              ? matchErrorMessage(query.error)
              : query.isPending
                ? '불러오는 중이에요.'
                : '매칭 정보를 찾을 수 없어요.'}
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
          onClick={() => navigate(ROUTES.donor.myRequests)}
        >
          목록으로
        </Button>
      </div>
    )
  }

  const direction = matchDirection(
    request.requestedBy,
    authenticatedRole === 'DONOR'
      ? 'DONOR'
      : null,
  )

  const receivedPending =
    request.status === 'PENDING' &&
    direction === 'received'

  if (receivedPending) {
    const message = splitRequestMessage(
      request.message,
      request.organizationName,
    )

    const pending =
      accept.isPending ||
      reject.isPending

    const handleAccept = async () => {
      if (pending) return

      setError('')
      setNotice(null)

      try {
        await accept.mutateAsync(request.matchId)
        setNotice({
          title: '기부 요청을 수락했어요',
          description: '채팅방에서 기관과 전달 방법을 이야기해 보세요.',
        })
      } catch (cause) {
        setError(matchErrorMessage(cause))
      }
    }

    const handleReject = async () => {
      if (pending) return

      setError('')
      setNotice(null)

      try {
        await reject.mutateAsync(request.matchId)

        setRejectOpen(false)
        setNotice({ title: '기부 요청을 거절했어요' })
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
            기부 요청 · 응답
          </h1>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-3">
          <h2 className="typography-heading-2 text-neutral-900">
            {request.organizationName}
          </h2>

          <section className="mt-5 rounded-card border border-neutral-200 bg-white p-4">
            <h3 className="typography-title-2 text-neutral-900">
              {request.donationItemName} {request.quantity}{request.unit}
              {' · '}신청 가능 수량{' '}
              {request.donationItemRemainingQuantity}{request.unit}
            </h3>

            <dl className="mt-4 space-y-3">
              <InfoRow
                label="물품 상태"
                value={conditionText(request.conditionGrade)}
              />
              <InfoRow
                label="수령 기관"
                value={request.organizationName}
              />
              <InfoRow
                label="기관 지역"
                value={request.neededItemRegion}
              />
            </dl>
          </section>

          <section className="mt-4 rounded-card bg-primary-100 p-4">
            <h3 className="typography-title-3 text-primary-700">
              {message.title}
            </h3>

            <p className="mt-3 whitespace-pre-wrap typography-body-1 text-neutral-900">
              {message.body}
            </p>
          </section>

          <Button
            variant="secondary"
            className="mt-4 w-full border-primary-700"
            disabled={pending}
            onClick={() => {
              setError('')
              setRejectOpen(true)
            }}
          >
            거절
          </Button>

          <section className="mt-4 typography-label-2 leading-5 text-neutral-700">
            <p>기관이 물품을 받고 싶다는 요청이에요.</p>
            <p>
              수락·채팅 시작만으로 예약·기부가 확정되지 않아요.
            </p>
          </section>

          {notice ? (
            <Toast
              title={notice.title}
              description={notice.description}
              className="mt-4 min-h-0 max-w-none shadow-none"
            />
          ) : null}

          {error ? (
            <Toast
              variant="error"
              title="요청을 처리하지 못했어요"
              description={error}
              className="mt-4 min-h-0 max-w-none shadow-none"
            />
          ) : null}
        </main>

        <footer className="shrink-0 bg-surface-canvas px-5 pb-5 pt-3">
          <Button
            className="w-full"
            disabled={pending}
            onClick={() => void handleAccept()}
          >
            {accept.isPending ? '수락 중...' : '수락하기'}
          </Button>
        </footer>

        <Dialog
          open={rejectOpen}
          title="이 요청을 거절할까요?"
          description={`${request.organizationName}의\n${request.donationItemName} ${request.quantity}${request.unit} 기부 요청을 거절해요.`}
          confirmText={reject.isPending ? '처리 중...' : '거절'}
          cancelText="취소"
          confirmVariant="danger"
          confirmDisabled={reject.isPending}
          cancelDisabled={reject.isPending}
          className="text-center [&>p]:whitespace-pre-line"
          onConfirm={() => void handleReject()}
          onCancel={() => {
            if (!reject.isPending) {
              setRejectOpen(false)
              setError('')
            }
          }}
        />
      </div>
    )
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
          {direction === 'sent'
            ? '제안 상세'
            : '기부 요청 · 응답'}
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="typography-heading-2 text-neutral-900">
            {request.organizationName}
          </h2>

          <TransactionStatus
            variant={
              request.status === 'RESERVED'
                ? 'reserved'
                : request.status === 'COMPLETED'
                  ? 'complete'
                  : 'trading'
            }
            className="shrink-0"
          >
            {request.status === 'COMPLETED'
              ? '전달 완료'
              : matchStatusLabel(request.status)}
          </TransactionStatus>
        </div>

        <section className="mt-5 rounded-card border border-neutral-200 bg-white p-4">
          <h3 className="typography-title-2 text-neutral-900">
            {request.donationItemName} {request.quantity}{request.unit}
          </h3>

          <dl className="mt-4 space-y-3">
            <InfoRow
              label="물품 상태"
              value={conditionText(request.conditionGrade)}
            />
            <InfoRow
              label="수령 기관"
              value={request.organizationName}
            />
            <InfoRow
              label="기관 지역"
              value={request.neededItemRegion}
            />
            <InfoRow
              label="신청 수량"
              value={`${request.quantity}${request.unit}`}
            />
          </dl>
        </section>

        {request.message ? (
          <section className="mt-4">
            <h3 className="flex items-center gap-1.5 typography-label-1 text-primary-700">
              <MessageCircle aria-hidden size={16} strokeWidth={2} />
              {direction === 'sent' ? '기관에 보낸 메시지' : '기관에서 보낸 메시지'}
            </h3>
            <p className="mt-2 rounded-card bg-primary-100 p-4 whitespace-pre-wrap typography-body-1 text-neutral-900">
              {request.message}
            </p>
          </section>
        ) : null}

        {notice ? (
          <Toast
            title={notice.title}
            description={notice.description}
            className="mt-4 min-h-0 max-w-none shadow-none"
          />
        ) : null}

        <div className="mt-5">
          <MatchActions
            key={request.matchId}
            match={request}
            audience="DONOR"
            authenticatedRole={authenticatedRole}
          />
        </div>

        {request.status === 'TRADING' ||
        request.status === 'RESERVED' ? (
          <Button
            variant="secondary"
            className="mt-3 w-full"
            onClick={() =>
              navigate(
                routePath.tradeDetail(
                  String(request.matchId),
                ),
              )
            }
          >
            거래 상세
          </Button>
        ) : null}
      </main>
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
    <div className="grid grid-cols-[88px_1fr] gap-3 typography-body-2">
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

function splitRequestMessage(
  value: string,
  organizationName: string,
) {
  const text = value.trim()

  if (!text) {
    return {
      title: `${organizationName}의 요청`,
      body: '기관에서 물품을 요청했어요.',
    }
  }

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length > 1) {
    return {
      title: lines[0],
      body: lines.slice(1).join('\n'),
    }
  }

  return {
    title: `${organizationName}의 요청`,
    body: text,
  }
}
