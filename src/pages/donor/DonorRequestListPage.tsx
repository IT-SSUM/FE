import {
  ChevronLeft,
} from 'lucide-react'

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { TransactionStatus } from '@/components/common/TransactionStatus/TransactionStatus'

import {
  useMatchesQuery,
} from '@/hooks/queries/useMatchesQuery'

import {
  matchErrorMessage,
} from '@/apis/match'

import {
  matchDirection,
  matchStatusLabel,
} from '@/features/matches/MatchActions'

import {
  getAuthSession,
} from '@/features/auth/storage'

import {
  routePath,
} from '@/routes/paths'

export function DonorRequestListPage() {
  const navigate =
    useNavigate()

  const query =
    useMatchesQuery()

  const [
    params,
    setParams,
  ] =
    useSearchParams()

  const authenticatedRole =
    getAuthSession()?.role ??
    null

  const tab =
    params.get(
      'tab',
    ) === 'sent'
      ? 'sent'
      : 'received'

  const items =
    (
      query.data ??
      []
    ).map(
      (item) => ({
        ...item,

        direction:
          matchDirection(
            item.requestedBy,
            authenticatedRole ===
              'DONOR'
              ? 'DONOR'
              : null,
          ),
      }),
    )

  const received =
    items.filter(
      (item) =>
        item.direction ===
        'received',
    )

  const sent =
    items.filter(
      (item) =>
        item.direction ===
        'sent',
    )

  const visible =
    tab === 'received'
      ? received
      : sent

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
          />
        </button>

        <h1 className="typography-title-3 text-neutral-900">
          받은 요청 · 보낸 제안
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-3">
        <div className="flex gap-2">
          <Tab
            active={
              tab ===
              'received'
            }
            label={`받은 요청 ${received.length}`}
            onClick={() =>
              setParams(
                {
                  tab:
                    'received',
                },
                {
                  replace:
                    true,
                },
              )
            }
          />

          <Tab
            active={
              tab ===
              'sent'
            }
            label={`보낸 제안 ${sent.length}`}
            onClick={() =>
              setParams(
                {
                  tab:
                    'sent',
                },
                {
                  replace:
                    true,
                },
              )
            }
          />
        </div>

        {query.isPending ? (
          <p
            role="status"
            className="mt-4 typography-body-2 text-neutral-700"
          >
            목록을 불러오고 있어요.
          </p>
        ) : null}

        {query.isError ? (
          <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
            <p className="text-error">
              {matchErrorMessage(
                query.error,
              )}
            </p>

            <button
              type="button"
              className="mt-2 text-primary-700 underline"
              onClick={() =>
                void query.refetch()
              }
            >
              다시 시도
            </button>
          </section>
        ) : null}

        {!query.isPending &&
        !query.isError ? (
          <section className="mt-4 space-y-3">
            {visible.length ? (
              visible.map(
                (item) => (
                  <button
                    key={
                      item.matchId
                    }
                    type="button"
                    onClick={() =>
                      navigate(
                        routePath.donorRequestDetail(
                          String(
                            item.matchId,
                          ),
                        ),
                      )
                    }
                    className="w-full rounded-card border border-neutral-200 bg-white p-4 text-left"
                  >
                    <h2 className="typography-title-2 text-neutral-900">
                      {
                        item.organizationName
                      }
                    </h2>

                    <p className="mt-2 typography-body-2 text-neutral-700">
                      {
                        item.donationItemName
                      }{' '}
                      {
                        item.quantity
                      }
                      {
                        item.unit
                      }{' '}
                      ·{' '}
                      {
                        item.neededItemRegion
                      }
                    </p>

                    <div className="mt-2">
                      <TransactionStatus
                        variant={
                          item.status ===
                          'RESERVED'
                            ? 'reserved'
                            : item.status ===
                                'COMPLETED'
                              ? 'complete'
                              : 'trading'
                        }
                      >
                        {matchStatusLabel(
                          item.status,
                        )}
                      </TransactionStatus>
                    </div>

                    <p className="mt-3 text-right typography-label-1 text-primary-700">
                      {tab ===
                      'received'
                        ? '요청 상세 보기 →'
                        : '제안 내용 보기 →'}
                    </p>
                  </button>
                ),
              )
            ) : (
              <p className="py-8 text-center typography-body-2 text-neutral-700">
                {tab ===
                'received'
                  ? '받은 요청이 없어요.'
                  : '보낸 제안이 없어요.'}
              </p>
            )}
          </section>
        ) : null}
      </main>

      <BottomNavigation
        activeItem="my"
        className="shrink-0"
      />
    </div>
  )
}

function Tab({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={
        active
      }
      onClick={onClick}
      className={
        active
          ? 'rounded-pill bg-primary-700 px-3 py-2 typography-label-1 text-white'
          : 'rounded-pill border border-neutral-200 bg-white px-3 py-2 typography-label-1 text-neutral-700'
      }
    >
      {label}
    </button>
  )
}