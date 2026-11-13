import { ChevronLeft } from 'lucide-react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { matchErrorMessage } from '@/apis/match'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { getAuthSession } from '@/features/auth/storage'
import {
  matchDirection,
  matchStatusLabel,
} from '@/features/matches/MatchActions'
import { useMatchesQuery } from '@/hooks/queries/useMatchesQuery'
import { routePath } from '@/routes/paths'

type RequestTab = 'received' | 'sent'

export function DonorRequestListPage() {
  const navigate = useNavigate()
  const query = useMatchesQuery()
  const [params, setParams] = useSearchParams()

  const authenticatedRole =
    getAuthSession()?.role ?? null

  const tab: RequestTab =
    params.get('tab') === 'sent'
      ? 'sent'
      : 'received'

  const current = (query.data ?? []).map((item) => ({
    ...item,
    direction: matchDirection(
      item.requestedBy,
      authenticatedRole === 'DONOR'
        ? 'DONOR'
        : null,
    ),
  }))

  const received = current.filter(
    (item) => item.direction === 'received',
  )

  const sent = current.filter(
    (item) => item.direction === 'sent',
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
          onClick={() => navigate(-1)}
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>

        <h1 className="typography-title-3 text-neutral-900">
          받은 요청 · 보낸 제안
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-3">
        <div className="flex gap-2">
          <TabButton
            active={tab === 'received'}
            label={`받은 요청 ${received.length}`}
            onClick={() =>
              setParams(
                { tab: 'received' },
                { replace: true },
              )
            }
          />

          <TabButton
            active={tab === 'sent'}
            label={`보낸 제안 ${sent.length}`}
            onClick={() =>
              setParams(
                { tab: 'sent' },
                { replace: true },
              )
            }
          />
        </div>

        {query.isPending ? (
          <p
            role="status"
            className="mt-5 typography-body-2 text-neutral-700"
          >
            요청과 제안을 불러오고 있어요.
          </p>
        ) : null}

        {query.isError ? (
          <section
            role="alert"
            className="mt-5 rounded-card border border-neutral-200 bg-white p-5"
          >
            <p className="typography-body-2 text-error">
              {matchErrorMessage(query.error)}
            </p>

            <button
              type="button"
              className="mt-3 typography-label-1 text-primary-700 underline"
              onClick={() => void query.refetch()}
            >
              다시 시도
            </button>
          </section>
        ) : null}

        {!query.isPending && !query.isError ? (
          <section className="mt-4 space-y-3">
            {visible.length > 0 ? (
              visible.map((item) => (
                <RequestCard
                  key={item.matchId}
                  organizationName={item.organizationName}
                  itemName={item.donationItemName}
                  quantity={item.quantity}
                  unit={item.unit}
                  region={item.neededItemRegion}
                  status={item.status}
                  cta={
                    tab === 'received'
                      ? '요청 상세 보기 →'
                      : '제안 내용 보기 →'
                  }
                  onClick={() =>
                    navigate(
                      routePath.donorRequestDetail(
                        String(item.matchId),
                      ),
                    )
                  }
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="typography-title-3 text-neutral-900">
                  {tab === 'received'
                    ? '받은 요청이 없어요.'
                    : '보낸 제안이 없어요.'}
                </p>

                <p className="mt-2 typography-body-2 text-neutral-700">
                  {tab === 'received'
                    ? '기관에서 물품을 요청하면 이곳에서 확인할 수 있어요.'
                    : '기관에 보낸 제안이 이곳에 표시돼요.'}
                </p>
              </div>
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

function TabButton({
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
      aria-pressed={active}
      onClick={onClick}
      className={
        active
          ? 'h-9 shrink-0 rounded-pill bg-primary-700 px-4 typography-label-1 text-white'
          : 'h-9 shrink-0 rounded-pill border border-neutral-200 bg-white px-4 typography-label-1 text-neutral-700'
      }
    >
      {label}
    </button>
  )
}

function RequestCard({
  organizationName,
  itemName,
  quantity,
  unit,
  region,
  status,
  cta,
  onClick,
}: {
  organizationName: string
  itemName: string
  quantity: number
  unit: string
  region: string
  status: string
  cta: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-card border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-100"
    >
      <h2 className="typography-title-3 text-neutral-900">
        {organizationName}
      </h2>

      <p className="mt-2 typography-label-2 text-neutral-700">
        {itemName} {quantity}{unit} · {region}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <StatusBadge status={status} />

        <span className="typography-label-1 text-primary-700">
          {cta}
        </span>
      </div>
    </button>
  )
}

function StatusBadge({
  status,
}: {
  status: string
}) {
  const label = matchStatusLabel(status)

  if (status === 'PENDING') {
    return (
      <span className="inline-flex h-7 items-center rounded-pill bg-warning-bg px-3 typography-label-2 text-warning">
        {label}
      </span>
    )
  }

  if (
    status === 'TRADING' ||
    status === 'RESERVED'
  ) {
    return (
      <span className="inline-flex h-7 items-center rounded-pill bg-primary-100 px-3 typography-label-2 text-primary-700">
        {label}
      </span>
    )
  }

  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex h-7 items-center rounded-pill bg-success-bg px-3 typography-label-2 text-success">
        전달 완료
      </span>
    )
  }

  return (
    <span className="inline-flex h-7 items-center rounded-pill bg-neutral-100 px-3 typography-label-2 text-neutral-700">
      {label}
    </span>
  )
}