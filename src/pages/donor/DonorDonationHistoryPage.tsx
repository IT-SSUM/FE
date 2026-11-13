import {
  BookOpen,
  Package,
} from 'lucide-react'

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import {
  matchErrorMessage,
} from '@/apis/match'

import {
  BottomNavigation,
} from '@/components/common/BottomNavigation/BottomNavigation'

import {
  Button,
} from '@/components/common/Button/Button'

import {
  DonorPage,
} from '@/features/donor/DonorPage'

import {
  useMatchesQuery,
} from '@/hooks/queries/useMatchesQuery'

import {
  ROUTES,
  routePath,
} from '@/routes/paths'

import type {
  MatchListItem,
} from '@/types/match'

type HistoryStatus =
  | 'TRADING'
  | 'RESERVED'
  | 'COMPLETED'
  | 'CANCELED'

const HISTORY_FILTERS: Array<{
  value: HistoryStatus
  label: string
}> = [
  {
    value: 'TRADING',
    label: '거래중',
  },
  {
    value: 'RESERVED',
    label: '예약중',
  },
  {
    value: 'COMPLETED',
    label: '전달 완료',
  },
  {
    value: 'CANCELED',
    label: '거래 취소',
  },
]

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

  const requestedFilter =
    params.get(
      'status',
    )

  const filter:
    HistoryStatus =
    HISTORY_FILTERS.some(
      (item) =>
        item.value ===
        requestedFilter,
    )
      ? requestedFilter as HistoryStatus
      : 'TRADING'

  const items =
    (
      query.data ??
      []
    ).filter(
      (item) =>
        normalizeHistoryStatus(
          item.status,
        ) ===
        filter,
    )

  const openMatch =
    (
      item:
        MatchListItem,
    ) => {
      const status =
        normalizeHistoryStatus(
          item.status,
        )

      if (
        status ===
          'TRADING' ||
        status ===
          'RESERVED'
      ) {
        navigate(
          routePath.tradeDetail(
            String(
              item.matchId,
            ),
          ),
        )

        return
      }

      navigate(
        routePath.donorRequestDetail(
          String(
            item.matchId,
          ),
        ),
      )
    }

  return (
    <DonorPage
      title="기관별 거래 내역"
      back={
        ROUTES.donor
          .myPage
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

      <div className="flex gap-2 overflow-x-auto pb-1">
        {HISTORY_FILTERS.map(
          (item) => (
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
                  ? 'h-9 shrink-0 rounded-pill bg-primary-700 px-4 typography-label-1 text-white'
                  : 'h-9 shrink-0 rounded-pill border border-neutral-200 bg-white px-4 typography-label-1 text-neutral-700'
              }
            >
              {
                item.label
              }
            </button>
          ),
        )}
      </div>

      {query.isPending ? (
        <p
          role="status"
          className="py-8 text-center typography-body-2 text-neutral-700"
        >
          거래 내역을
          불러오고 있어요.
        </p>
      ) : null}

      {query.isError ? (
        <section
          role="alert"
          className="rounded-card border border-neutral-200 bg-white p-5"
        >
          <p className="typography-body-2 text-error">
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
        <section className="space-y-3">
          {items.length >
          0 ? (
            items.map(
              (item) => (
                <HistoryCard
                  key={
                    item.matchId
                  }
                  item={
                    item
                  }
                  status={
                    filter
                  }
                  onClick={() =>
                    openMatch(
                      item,
                    )
                  }
                />
              ),
            )
          ) : (
            <div className="py-12 text-center">
              <p className="typography-title-3 text-neutral-900">
                {emptyTitle(
                  filter,
                )}
              </p>

              <p className="mt-2 typography-body-2 text-neutral-700">
                {emptyDescription(
                  filter,
                )}
              </p>
            </div>
          )}
        </section>
      ) : null}
    </DonorPage>
  )
}

function HistoryCard({
  item,
  status,
  onClick,
}: {
  item:
    MatchListItem

  status:
    HistoryStatus

  onClick:
    () => void
}) {
  const isBook =
    item.donationItemName.includes(
      '도서',
    ) ||
    item.donationItemName.includes(
      '책',
    )

  const Icon =
    isBook
      ? BookOpen
      : Package

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="flex w-full items-center gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-100"
    >
      <div
        className={[
          'flex size-[72px] shrink-0 items-center justify-center rounded-input text-primary-700',

          status ===
          'CANCELED'
            ? 'bg-[#EEF3FB]'
            : 'bg-error-bg',
        ].join(
          ' ',
        )}
      >
        <Icon
          aria-hidden
          size={28}
          strokeWidth={2}
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate typography-title-3 text-neutral-900">
          {
            item.organizationName
          }{' '}
          ·{' '}
          {
            item.donationItemName
          }{' '}
          {
            item.quantity
          }
          {
            item.unit
          }
        </h3>

        <p className="mt-1 typography-label-2 text-neutral-700">
          {historyDescription(
            item,
            status,
          )}
        </p>

        <span
          className={
            status ===
            'CANCELED'
              ? 'mt-2 inline-flex h-7 items-center rounded-pill bg-neutral-100 px-3 typography-label-2 text-neutral-700'
              : status ===
                  'COMPLETED'
                ? 'mt-2 inline-flex h-7 items-center rounded-pill bg-success-bg px-3 typography-label-2 text-success'
                : 'mt-2 inline-flex h-7 items-center rounded-pill bg-primary-100 px-3 typography-label-2 text-primary-700'
          }
        >
          {historyStatusLabel(
            status,
          )}
        </span>
      </div>
    </button>
  )
}

function normalizeHistoryStatus(
  status: string,
):
  | HistoryStatus
  | null {
  if (
    status ===
      'TRADING' ||
    status ===
      'SHARING'
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

function historyStatusLabel(
  status:
    HistoryStatus,
) {
  switch (
    status
  ) {
    case 'TRADING':
      return '거래중'

    case 'RESERVED':
      return '예약중'

    case 'COMPLETED':
      return '전달 완료'

    case 'CANCELED':
      return '거래 취소'
  }
}

function historyDescription(
  item:
    MatchListItem,

  status:
    HistoryStatus,
) {
  switch (
    status
  ) {
    case 'TRADING':
      return '수량·일정·전달 방법 협의 중'

    case 'RESERVED':
      return `기부자가 ${item.quantity}${item.unit}를 임시 예약했어요`

    case 'COMPLETED':
      return item.completedAt
        ? `${formatCompletedDate(
            item.completedAt,
          )} 전달 완료`
        : '기관이 수령을 확인했어요'

    case 'CANCELED':
      return '취소된 거래예요'
  }
}

function formatCompletedDate(
  value:
    string,
) {
  const date =
    new Date(
      value,
    )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'ko-KR',
    {
      timeZone:
        'Asia/Seoul',

      year:
        'numeric',

      month:
        'long',

      day:
        'numeric',
    },
  ).format(
    date,
  )
}

function emptyTitle(
  status:
    HistoryStatus,
) {
  switch (
    status
  ) {
    case 'TRADING':
      return '거래중인 나눔이 없어요.'

    case 'RESERVED':
      return '예약중인 나눔이 없어요.'

    case 'COMPLETED':
      return '전달 완료된 나눔이 없어요.'

    case 'CANCELED':
      return '취소된 거래가 없어요.'
  }
}

function emptyDescription(
  status:
    HistoryStatus,
) {
  switch (
    status
  ) {
    case 'TRADING':
      return '기관과 협의 중인 거래가 이곳에 표시돼요.'

    case 'RESERVED':
      return '전달 수량이 예약되면 이곳에서 확인할 수 있어요.'

    case 'COMPLETED':
      return '기관이 수령을 확인한 나눔이 표시돼요.'

    case 'CANCELED':
      return '취소된 거래 내역이 이곳에 표시돼요.'
  }
}