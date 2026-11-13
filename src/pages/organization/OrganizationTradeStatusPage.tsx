import {
  ChevronLeft,
  ClipboardList,
} from 'lucide-react'

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import {
  getMatchErrorMessage,
  type MatchListItem,
} from '@/apis/matches'

import {
  BottomNavigation,
} from '@/components/common/BottomNavigation/BottomNavigation'

import {
  Button,
} from '@/components/common/Button/Button'

import {
  useMatches,
} from '@/hooks/matches/useMatches'

import {
  routePath,
} from '@/routes/paths'

import {
  OrganizationTradeCard,
  TradeStatusTabs,
  type OrganizationTradeCardData,
} from './TradeStatusComponents'

import {
  type OrganizationTradeStatus,
} from './organizationTrades'

const TRADE_STATUSES:
  OrganizationTradeStatus[] = [
    'progress',
    'complete',
    'canceled',
  ]

function parseTradeStatus(
  value:
    string | null,
):
  OrganizationTradeStatus {
  if (
    value &&
    TRADE_STATUSES.includes(
      value as OrganizationTradeStatus,
    )
  ) {
    return value as OrganizationTradeStatus
  }

  return 'progress'
}

function formatTradeDate(
  value:
    string | null,
) {
  if (!value) {
    return null
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null
  }

  return new Intl.DateTimeFormat(
    'ko-KR',
    {
      month:
        'long',
      day:
        'numeric',
    },
  ).format(date)
}

function toTradeCard(
  match:
    MatchListItem,
):
  OrganizationTradeCardData {
  const status:
    OrganizationTradeStatus =
    match.status ===
      'COMPLETED'
      ? 'complete'
      : match.status ===
          'CANCELED'
        ? 'canceled'
        : 'progress'

  const scheduledDate =
    formatTradeDate(
      match.scheduledAt,
    )

  const completedDate =
    formatTradeDate(
      match.completedAt,
    )

  const deliveryLabel =
    match.deliveryMethod ===
      'PARCEL'
      ? '택배 전달 예정'
      : match.deliveryMethod ===
          'DIRECT'
        ? '직접 전달 예정'
        : '전달 예정'

  const description =
    match.status ===
      'TRADING'
      ? '전달 일정 조율 중'
      : match.status ===
          'RESERVED'
        ? scheduledDate
          ? `${scheduledDate} · ${deliveryLabel}`
          : '전달 일정 확정 대기'
        : match.status ===
            'COMPLETED'
          ? `${completedDate ?? '전달'} · 수령 완료`
          : '거래가 취소됐어요.'

  const badge =
    match.status ===
      'TRADING'
      ? '거래중'
      : match.status ===
          'RESERVED'
        ? '예약중'
        : match.status ===
            'COMPLETED'
          ? '전달 완료'
          : '거래 취소'

  return {
    id:
      String(
        match.matchId,
      ),

    donorName:
      match.donorName,

    itemName:
      `${match.donationItemName} ${match.quantity}${match.unit}`,

    category:
      'package',

    status,

    description,

    badge,
  }
}

export function OrganizationTradeStatusPage() {
  const navigate =
    useNavigate()

  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams()

  const status =
    parseTradeStatus(
      searchParams.get(
        'status',
      ),
    )

  const matchesQuery =
    useMatches()

  const trades =
    (
      matchesQuery.data ??
      []
    )
      .filter(
        (match) =>
          [
            'TRADING',
            'RESERVED',
            'COMPLETED',
            'CANCELED',
          ].includes(
            match.status,
          ),
      )
      .map(
        toTradeCard,
      )
      .filter(
        (trade) =>
          trade.status ===
          status,
      )

  const errorMessage =
    matchesQuery.error
      ? getMatchErrorMessage(
          matchesQuery.error,
          '거래 현황을 불러오지 못했어요.',
        )
      : ''

  const handleStatusChange =
    (
      nextStatus:
        OrganizationTradeStatus,
    ) => {
      setSearchParams(
        {
          status:
            nextStatus,
        },
        {
          replace:
            true,
        },
      )
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
          거래 현황
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-3">
        <TradeStatusTabs
          status={
            status
          }
          onChange={
            handleStatusChange
          }
        />

        <section
          className="mt-4 space-y-3"
          aria-label="거래 목록"
        >
          {matchesQuery.isLoading ? (
            <p
              className="py-12 text-center typography-body-2 text-neutral-700"
              role="status"
            >
              거래 현황을 불러오는 중이에요.
            </p>
          ) : matchesQuery.isError ? (
            <div
              className="py-12 text-center"
              role="alert"
            >
              <p className="typography-body-2 text-error">
                {
                  errorMessage
                }
              </p>

              <Button
                variant="secondary"
                className="mt-4 h-10"
                onClick={() =>
                  void matchesQuery.refetch()
                }
              >
                다시 시도
              </Button>
            </div>
          ) : trades.length ===
            0 ? (
            <div className="rounded-card bg-neutral-100 px-5 py-12 text-center">
              <ClipboardList
                aria-hidden
                size={36}
                className="mx-auto text-neutral-500"
              />

              <p className="mt-3 typography-body-2 text-neutral-700">
                해당 상태의 거래가 없어요.
              </p>
            </div>
          ) : (
            trades.map(
              (
                trade,
              ) => (
                <OrganizationTradeCard
                  key={
                    trade.id
                  }
                  trade={
                    trade
                  }
                  onClick={() =>
                    navigate(
                      routePath.organizationActiveTradeDetail(
                        trade.id,
                      ),
                    )
                  }
                />
              ),
            )
          )}
        </section>
      </main>

      <BottomNavigation
        audience="organization"
        activeItem="my"
        className="sticky bottom-0 shrink-0"
      />
    </div>
  )
}