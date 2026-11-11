import {
  PackageCheck,
} from 'lucide-react'

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'

import {
  DonorPage,
} from '@/features/donor/DonorPage'

import {
  useMatchesQuery,
} from '@/hooks/queries/useMatchesQuery'

import {
  matchErrorMessage,
} from '@/apis/match'

import {
  ROUTES,
  routePath,
} from '@/routes/paths'

type HistoryFilter =
  | 'TRADING'
  | 'RESERVED'
  | 'COMPLETED'
  | 'CANCELED'

const filters:
  Array<{
    value:
      HistoryFilter
    label:
      string
  }> = [
  {
    value:
      'TRADING',
    label:
      '거래중',
  },
  {
    value:
      'RESERVED',
    label:
      '예약중',
  },
  {
    value:
      'COMPLETED',
    label:
      '전달 완료',
  },
  {
    value:
      'CANCELED',
    label:
      '거래 취소',
  },
]

function normalizeStatus(
  status: string,
): HistoryFilter | null {
  if (
    status ===
    'TRADING'
  ) {
    return 'TRADING'
  }

  if (
    status ===
    'RESERVED'
  ) {
    return 'RESERVED'
  }

  if (
    status ===
    'COMPLETED'
  ) {
    return 'COMPLETED'
  }

  if (
    status ===
      'CANCELED' ||
    status ===
      'CANCELLED' ||
    status ===
      'REJECTED' ||
    status ===
      'WITHDRAWN'
  ) {
    return 'CANCELED'
  }

  return null
}

export function DonorDonationHistoryPage() {
  const navigate =
    useNavigate()

  const [
    params,
    setParams,
  ] =
    useSearchParams()

  const query =
    useMatchesQuery()

  const filter =
    (
      params.get(
        'status',
      ) as
        | HistoryFilter
        | null
    ) ??
    'TRADING'

  const items =
    (
      query.data ??
      []
    ).filter(
      (item) =>
        normalizeStatus(
          item.status,
        ) === filter,
    )

  return (
    <DonorPage
      title="기관별 거래 내역"
      back={
        ROUTES.donor.myPage
      }
      footer={
        <BottomNavigation
          activeItem="my"
        />
      }
    >
      <h2 className="typography-heading-2 text-neutral-900">
        기관별 전달 현황
      </h2>

      <div className="flex gap-2 overflow-x-auto">
        {filters.map(
          (
            item,
          ) => (
            <button
              key={
                item.value
              }
              type="button"
              aria-pressed={
                filter ===
                item.value
              }
              onClick={() =>
                setParams(
                  {
                    status:
                      item.value,
                  },
                  {
                    replace:
                      true,
                  },
                )
              }
              className={
                filter ===
                item.value
                  ? 'shrink-0 rounded-pill bg-primary-700 px-3 py-2 typography-label-1 text-white'
                  : 'shrink-0 rounded-pill border border-neutral-200 bg-white px-3 py-2 typography-label-1 text-neutral-700'
              }
            >
              {item.label}
            </button>
          ),
        )}
      </div>

      {query.isPending ? (
        <p role="status">
          거래 내역을 불러오고 있어요.
        </p>
      ) : null}

      {query.isError ? (
        <section className="rounded-card border border-neutral-200 bg-white p-5">
          <p className="text-error">
            {matchErrorMessage(
              query.error,
            )}
          </p>

          <Button
            variant="secondary"
            className="mt-3"
            onClick={() =>
              void query.refetch()
            }
          >
            다시 시도
          </Button>
        </section>
      ) : null}

      {!query.isPending &&
      !query.isError ? (
        items.length ? (
          <section className="space-y-3">
            {items.map(
              (item) => (
                <ItemRow
                  key={
                    item.matchId
                  }
                  title={`${item.organizationName} · ${item.donationItemName} ${item.quantity}${item.unit}`}
                  description={statusDescription(
                    item.status,
                  )}
                  status={
                    filter ===
                    'COMPLETED'
                      ? 'complete'
                      : filter ===
                          'RESERVED'
                        ? 'reserved'
                        : 'trading'
                  }
                  statusType="transaction"
                  icon={
                    <PackageCheck
                      aria-hidden
                      size={28}
                    />
                  }
                  className="shadow-none"
                  onClick={() =>
                    navigate(
                      filter ===
                        'TRADING' ||
                        filter ===
                          'RESERVED'
                        ? routePath.tradeDetail(
                            String(
                              item.matchId,
                            ),
                          )
                        : routePath.donorRequestDetail(
                            String(
                              item.matchId,
                            ),
                          ),
                    )
                  }
                />
              ),
            )}
          </section>
        ) : (
          <section className="rounded-card border border-neutral-200 bg-white p-6 text-center">
            <p className="typography-title-3 text-neutral-900">
              해당 상태의 거래가 없어요.
            </p>
          </section>
        )
      ) : null}
    </DonorPage>
  )
}

function statusDescription(
  status: string,
) {
  switch (status) {
    case 'TRADING':
      return '수량·일정·전달 방법 협의 중'

    case 'RESERVED':
      return '전달 수량과 일정이 예약됐어요.'

    case 'COMPLETED':
      return '기관에서 수령을 확인했어요.'

    default:
      return '거래가 취소됐어요.'
  }
}