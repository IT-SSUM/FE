import { Package } from 'lucide-react'
import {
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import {
  DonorPage,
  EmptyState,
} from '@/features/donor/DonorPage'
import {
  conditionLabel,
  getDonationItemFailure,
  parseDonationItemId,
} from '@/features/donor/donationItemApiState'
import { useDeleteDonationItemMutation } from '@/hooks/mutations/useDeleteDonationItemMutation'
import { useDonationItemQuery } from '@/hooks/queries/useDonationItemQuery'
import { ROUTES, routePath } from '@/routes/paths'

export function DonationDetailPage() {
  const { donationId } = useParams()
  const id = parseDonationItemId(donationId)
  const query = useDonationItemQuery(id)
  const remove = useDeleteDonationItemMutation()
  const navigate = useNavigate()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [error, setError] = useState('')
  const deleting = useRef(false)

  const frame = {
    title: '물품 상세',
    back: ROUTES.donor.myItems,
    mode: 'server' as const,
  }

  if (id === null) {
    return (
      <DonorPage {...frame}>
        <EmptyState
          title="올바른 서버 물품 번호가 필요해요"
          to={ROUTES.donor.myItems}
          label="내 물품 보기"
        />
      </DonorPage>
    )
  }

  if (query.isError) {
    const failure = getDonationItemFailure(query.error)

    return (
      <DonorPage {...frame}>
        <p role="alert" className="text-error">
          {failure.message}
        </p>

        <Button
          variant="secondary"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          다시 시도
        </Button>
      </DonorPage>
    )
  }

  if (query.isPending) {
    return (
      <DonorPage {...frame}>
        <p role="status">
          {query.isPaused
            ? '네트워크 연결을 기다리고 있어요.'
            : '물품 정보를 불러오고 있어요.'}
        </p>
      </DonorPage>
    )
  }

  const item = query.data

  if (!item) {
    return (
      <DonorPage {...frame}>
        <EmptyState
          title="물품 정보를 찾을 수 없어요"
          to={ROUTES.donor.myItems}
          label="내 물품 보기"
        />
      </DonorPage>
    )
  }

  const statusLabel =
    item.status === 'RECRUITING'
      ? '모집중'
      : item.status === 'FULL'
        ? '예약마감'
        : '전달 완료'

  const tryDelete = () => {
    setError('')

    if (item.reservedQuantity > 0) {
      setBlockedOpen(true)
      return
    }

    setDeleteOpen(true)
  }

  return (
    <DonorPage
      {...frame}
      footer={
        item.mine ? (
          <footer className="shrink-0 bg-surface-canvas p-5">
            <Button
              className="w-full"
              onClick={() =>
                navigate(
                  routePath.donorRecommendation(
                    String(id),
                  ),
                )
              }
            >
              추천 기관 보기
            </Button>
          </footer>
        ) : undefined
      }
    >
      <section>
        {item.imageUrls[0] ? (
          <img
            src={item.imageUrls[0]}
            alt={`${item.itemName} 물품 사진`}
            className="h-[216px] w-full rounded-card bg-white object-cover"
          />
        ) : (
          <div className="flex h-[216px] w-full items-center justify-center rounded-card bg-error-bg text-primary-700">
            <Package
              aria-hidden
              size={68}
              strokeWidth={2}
            />
          </div>
        )}

        <span className="mt-3 inline-flex h-7 items-center rounded-pill bg-neutral-100 px-3 typography-label-2 text-neutral-700">
          {statusLabel}
        </span>
      </section>

      <section className="rounded-card border border-neutral-200 bg-white p-4">
        <h2 className="typography-title-2 text-neutral-900">
          {item.itemName} · 총 등록 수량 {item.quantity}{item.unit}
        </h2>

        <dl className="mt-4 space-y-3">
          <InfoRow
            label="품목"
            value={item.itemName}
          />

          <InfoRow
            label="수량"
            value={
              <div className="space-y-1">
                <p>
                  총 등록 수량 {item.quantity}{item.unit}
                </p>
                <p>
                  예약 수량 {item.reservedQuantity}{item.unit}
                  {' · '}전달 완료 수량 {item.completedQuantity}{item.unit}
                </p>
                <p>
                  신청 가능 수량 {item.availableQuantity}{item.unit}
                </p>
              </div>
            }
          />

          <InfoRow
            label="물품 상태"
            value={
              conditionLabel[item.conditionGrade] ??
              item.conditionGrade
            }
          />

          <InfoRow
            label="물품 위치"
            value={item.regionName}
          />
        </dl>
      </section>

      {item.mine ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              navigate(
                routePath.donorDonationEdit(
                  String(id),
                ),
              )
            }
            className="inline-flex h-8 items-center justify-center rounded-pill border border-neutral-200 bg-white px-3 typography-label-2 text-primary-700"
          >
            수정
          </button>

          <button
            type="button"
            disabled={remove.isPending}
            onClick={tryDelete}
            className="inline-flex h-8 items-center justify-center rounded-pill border border-error/20 bg-white px-3 typography-label-2 text-error"
          >
            삭제
          </button>
        </div>
      ) : null}

      {item.mine ? (
        <section className="typography-label-2 leading-5 text-neutral-700">
          <p>신청 가능 = 총 등록 − 예약 − 전달 완료</p>
          <p>거래중 수량은 차감하지 않아요.</p>
          <p>물품 하나를 여러 기관에 나눌 수 있어요.</p>
          <p>예약 취소로 잔여 수량이 생기면 모집이 재개돼요.</p>
        </section>
      ) : null}

      {item.description ? (
        <section>
          <h3 className="typography-title-3 text-neutral-900">
            상세 설명
          </h3>

          <p className="mt-2 whitespace-pre-wrap typography-body-2 text-neutral-700">
            {item.description}
          </p>
        </section>
      ) : null}

      {error ? (
        <p role="alert" className="text-error">
          {error}
        </p>
      ) : null}

      <Dialog
        open={deleteOpen}
        title="물품을 삭제할까요?"
        description="삭제하면 물품을 다시 조회할 수 없어요."
        confirmText={remove.isPending ? '삭제 중...' : '삭제하기'}
        cancelText="닫기"
        confirmVariant="danger"
        onCancel={() => {
          if (!deleting.current) setDeleteOpen(false)
        }}
        onConfirm={async () => {
          if (deleting.current || !item.mine) return

          deleting.current = true

          try {
            await remove.mutateAsync(id)

            navigate(
              ROUTES.donor.myItems,
              { replace: true },
            )
          } catch (cause) {
            const failure = getDonationItemFailure(cause)

            setDeleteOpen(false)

            if (
              failure.status === 409 ||
              failure.code === 'ITEM_409'
            ) {
              setBlockedOpen(true)
            } else {
              setError(failure.message)
            }
          } finally {
            deleting.current = false
          }
        }}
      />

      <Dialog
        open={blockedOpen}
        title="예약된 물품은 삭제할 수 없어요"
        description="예약중 거래를 취소하면 예약 수량이 반환돼요."
        confirmText="거래 상세"
        cancelText="닫기"
        className="text-center"
        onConfirm={() => {
          setBlockedOpen(false)
          navigate(ROUTES.donor.myHistory)
        }}
        onCancel={() => setBlockedOpen(false)}
      />
    </DonorPage>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-3 typography-body-2">
      <dt className="text-neutral-700">
        {label}
      </dt>

      <dd className="min-w-0 break-words text-neutral-900">
        {value}
      </dd>
    </div>
  )
}