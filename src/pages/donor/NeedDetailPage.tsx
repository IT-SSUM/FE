import {
  BookOpen,
} from 'lucide-react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  Button,
} from '@/components/common/Button/Button'

import {
  DonorPage,
} from '@/features/donor/DonorPage'

import {
  getNeededItemErrorMessage,
} from '@/apis/neededItem'

import {
  useNeededItemQuery,
} from '@/hooks/queries/useNeededItemQuery'

import {
  ROUTES,
  routePath,
} from '@/routes/paths'

import type {
  ItemConditionCode,
} from '@/types/item'

export function NeedDetailPage() {
  const navigate =
    useNavigate()

  const {
    needId,
  } =
    useParams()

  const id =
    parsePositiveId(
      needId,
    )

  const query =
    useNeededItemQuery(
      id,
    )

  if (id === null) {
    return (
      <DonorPage
        title="물품 상세"
        back={
          ROUTES.donor
            .needList
        }
      >
        <StateCard
          message="올바른 필요 물품 번호가 필요해요."
        />
      </DonorPage>
    )
  }

  if (query.isPending) {
    return (
      <DonorPage
        title="물품 상세"
        back={
          ROUTES.donor
            .needList
        }
      >
        <p
          role="status"
          className="typography-body-2 text-neutral-700"
        >
          필요 물품 정보를
          불러오고 있어요.
        </p>
      </DonorPage>
    )
  }

  if (query.isError) {
    return (
      <DonorPage
        title="물품 상세"
        back={
          ROUTES.donor
            .needList
        }
      >
        <StateCard
          message={getNeededItemErrorMessage(
            query.error,
            '필요 물품 정보를 불러오지 못했어요.',
          )}
          action="다시 시도"
          onAction={() =>
            void query.refetch()
          }
        />
      </DonorPage>
    )
  }

  const need =
    query.data

  if (!need) {
    return (
      <DonorPage
        title="물품 상세"
        back={
          ROUTES.donor
            .needList
        }
      >
        <StateCard
          message="필요 물품 정보를 찾을 수 없어요."
        />
      </DonorPage>
    )
  }

  const canDonate =
    need.status ===
      'RECRUITING' &&
    need.availableQuantity >
      0

  return (
    <DonorPage
      title="물품 상세"
      back={
        ROUTES.donor.needList
      }
      footer={
        <footer className="shrink-0 bg-surface-canvas p-5">
          <Button
            className="w-full"
            disabled={
              !canDonate
            }
            onClick={() =>
              navigate(
                routePath.donorDonationProposal(String(need.neededItemId)),
              )
            }
          >
            {canDonate
              ? '제안하기'
              : '현재 모집이 종료됐어요'}
          </Button>
        </footer>
      }
    >
      <div>
        <h2 className="typography-heading-2 text-neutral-900">
          {need.itemName}{' '}
          {
            need.availableQuantity
          }
          {need.unit}가
          필요해요
        </h2>

        <p className="mt-4 typography-body-1 text-neutral-700">
          {
            need.organizationName
          }{' '}
          ·{' '}
          {need.verificationStatus ===
          'VERIFIED'
            ? '사업자 확인 완료'
            : '사업자 확인 필요'}
        </p>
      </div>

      {need.referenceImageUrl ? (
        <img
          src={
            need.referenceImageUrl
          }
          alt={`${need.itemName} 참고 이미지`}
          className="h-[216px] w-full rounded-card object-cover"
        />
      ) : (
        <div className="flex h-[216px] w-full items-center justify-center rounded-card bg-error-bg text-primary-700">
          <BookOpen
            aria-hidden
            size={88}
            strokeWidth={2}
          />
        </div>
      )}

      <section className="rounded-card border border-neutral-200 bg-white p-4">
        <dl className="space-y-2">
          <NeedInfoRow
            label="필요 품목"
            value={
              need.itemName
            }
          />

          <NeedInfoRow
            label="필요 수량"
            value={`${need.availableQuantity}${need.unit}`}
          />

          <NeedInfoRow
            label="희망 상태"
            value={getConditionLabel(
              need.desiredCondition,
            )}
          />

          <NeedInfoRow
            label="기관 위치"
            value={
              need.organizationAddress ||
              need.regionName
            }
          />
        </dl>
      </section>

      {need.description ? (
        <p className="whitespace-pre-wrap typography-body-1 text-neutral-900">
          {
            need.description
          }
        </p>
      ) : null}

      <section>
        <h3 className="typography-title-2 text-neutral-900">
          기관 소개
        </h3>

        <p className="mt-4 whitespace-pre-wrap typography-body-1 text-neutral-900">
          {need.organizationIntroduction ||
            '등록된 기관 소개가 없어요.'}
        </p>
      </section>
    </DonorPage>
  )
}

function NeedInfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2">
      <dt className="typography-label-1 text-neutral-700">
        {label}
      </dt>

      <dd className="typography-body-2 text-neutral-900">
        {value}
      </dd>
    </div>
  )
}

function getConditionLabel(
  condition:
    ItemConditionCode,
) {
  switch (condition) {
    case 'HIGH':
      return '상'

    case 'MID':
      return '중 이상'

    case 'LOW':
      return '하 이상'
  }
}

function StateCard({
  message,
  action,
  onAction,
}: {
  message: string
  action?: string
  onAction?: () => void
}) {
  return (
    <section className="rounded-card border border-neutral-200 bg-white p-6 text-center">
      <p className="typography-title-3 text-neutral-900">
        {message}
      </p>

      {action &&
      onAction ? (
        <Button
          variant="secondary"
          className="mt-4"
          onClick={
            onAction
          }
        >
          {action}
        </Button>
      ) : null}
    </section>
  )
}

function parsePositiveId(
  value:
    | string
    | undefined,
) {
  if (
    !value ||
    !/^[1-9]\d*$/.test(
      value,
    )
  ) {
    return null
  }

  const id =
    Number(value)

  return Number.isSafeInteger(
    id,
  )
    ? id
    : null
}
