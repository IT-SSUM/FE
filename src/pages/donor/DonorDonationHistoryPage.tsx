import {
  PackageCheck,
} from 'lucide-react'

import {
  useNavigate,
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

export function DonorDonationHistoryPage() {
  const navigate =
    useNavigate()

  const query =
    useMatchesQuery()

  const items = [
    ...(query.data ??
      []),
  ]
    .filter(
      (item) =>
        item.status ===
        'COMPLETED',
    )
    .sort(
      (a, b) =>
        (
          b.completedAt ??
          ''
        ).localeCompare(
          a.completedAt ??
            '',
        ),
    )

  return (
    <DonorPage
      title="기부 내역"
      back={
        ROUTES.donor.myPage
      }
      footer={
        <BottomNavigation
          activeItem="my"
        />
      }
    >
      {query.isPending ? (
        <p role="status">
          기부 내역을
          불러오고 있어요.
        </p>
      ) : null}

      {query.isError ? (
        <section
          role="alert"
          className="rounded-card border border-neutral-200 bg-white p-5"
        >
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
        <>
          <h2 className="rounded-card border border-neutral-200 bg-white p-4 typography-title-2">
            완료된 기부{' '}
            {items.length}건
          </h2>

          {items.length ? (
            items.map(
              (item) => (
                <ItemRow
                  key={
                    item.matchId
                  }
                  title={`${item.donationItemName} ${item.quantity}${item.unit}`}
                  description={`${item.organizationName} · ${formatDate(item.completedAt)} 전달 완료`}
                  status="complete"
                  statusType="badge"
                  icon={
                    <PackageCheck
                      aria-hidden
                      size={28}
                    />
                  }
                  onClick={() =>
                    navigate(
                      routePath.donorRequestDetail(
                        String(
                          item.matchId,
                        ),
                      ),
                    )
                  }
                />
              ),
            )
          ) : (
            <section className="rounded-card border border-neutral-200 bg-white p-6 text-center">
              <h2 className="typography-title-3">
                아직 완료된
                기부가 없어요
              </h2>

              <Button
                variant="secondary"
                className="mt-4"
                onClick={() =>
                  navigate(
                    ROUTES.donor
                      .myRequests,
                  )
                }
              >
                진행 중 나눔 보기
              </Button>
            </section>
          )}
        </>
      ) : null}
    </DonorPage>
  )
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return ''
  }

  const date =
    new Date(value)

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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  ).format(date)
}