import {
  Package,
} from 'lucide-react'

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'

import {
  DonorPage,
  EmptyState,
} from '@/features/donor/DonorPage'

import {
  getDonationItemFailure,
} from '@/features/donor/donationItemApiState'

import {
  useDonorDonationItemsQuery,
} from '@/hooks/queries/useDonorDonationItemsQuery'

import {
  ROUTES,
  routePath,
} from '@/routes/paths'

import type {
  DonationItemStatus,
  MyDonationItem,
} from '@/types/donationItem'

const statusLabels:
  Record<
    DonationItemStatus,
    string
  > = {
  RECRUITING:
    '모집중',

  FULL:
    '예약마감',

  COMPLETED:
    '전달 완료',
}

export function DonorDonationManagePage() {
  const navigate =
    useNavigate()

  const [
    params,
    setParams,
  ] =
    useSearchParams()

  const query =
    useDonorDonationItemsQuery()

  const items =
    query.data ?? []

  const filter =
    params.get(
      'category',
    ) ?? ''

  const categories =
    Array.from(
      new Set(
        items
          .map(
            (item) =>
              item.categoryName,
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(value),
          ),
      ),
    )

  const filtered =
    filter
      ? items.filter(
          (item) =>
            item.categoryName ===
            filter,
        )
      : items

  return (
    <DonorPage
      title="등록한 물품"
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
      {query.isPending ? (
        <p
          role="status"
          className="py-8 text-center typography-body-2 text-neutral-700"
        >
          등록한 물품을 불러오고
          있어요.
        </p>
      ) : null}

      {query.isError ? (
        <section
          role="alert"
          className="rounded-card border border-error/30 bg-error-bg p-5"
        >
          <p className="typography-body-2 text-error">
            {getDonationItemFailure(
              query.error,
            ).message}
          </p>

          <Button
            variant="secondary"
            className="mt-4"
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
          <div className="flex gap-2 overflow-x-auto pb-1">
            <CategoryChip
              active={
                !filter
              }
              label={`전체 ${items.length}`}
              onClick={() =>
                setParams(
                  {},
                  {
                    replace:
                      true,
                  },
                )
              }
            />

            {categories.map(
              (category) => (
                <CategoryChip
                  key={
                    category
                  }
                  active={
                    filter ===
                    category
                  }
                  label={shortCategoryName(
                    category,
                  )}
                  onClick={() =>
                    setParams(
                      {
                        category,
                      },
                      {
                        replace:
                          true,
                      },
                    )
                  }
                />
              ),
            )}
          </div>

          {filtered.length >
          0 ? (
            <>
              <section className="space-y-3">
                {filtered.map(
                  (item) => (
                    <DonationCard
                      key={
                        item.donationItemId
                      }
                      item={
                        item
                      }
                      onClick={() =>
                        navigate(
                          routePath.donorDonationDetail(
                            String(
                              item.donationItemId,
                            ),
                          ),
                        )
                      }
                    />
                  ),
                )}
              </section>

              <div className="mt-8 flex justify-end">
                <Button
                  className="h-12 rounded-pill px-5"
                  onClick={() =>
                    navigate(
                      ROUTES.donor
                        .donationNew,
                    )
                  }
                >
                  등록하기
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              title="등록된 물품이 없어요"
              to={
                ROUTES.donor
                  .donationNew
              }
              label="물품 등록하기"
            />
          )}
        </>
      ) : null}
    </DonorPage>
  )
}

function CategoryChip({
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
      onClick={
        onClick
      }
      className={
        active
          ? 'h-9 shrink-0 rounded-pill bg-primary-700 px-3 typography-label-1 text-white'
          : 'h-9 shrink-0 rounded-pill border border-neutral-200 bg-white px-3 typography-label-1 text-neutral-700'
      }
    >
      {label}
    </button>
  )
}

function DonationCard({
  item,
  onClick,
}: {
  item: MyDonationItem
  onClick: () => void
}) {
  const image =
    item.imageUrl ??
    item.imageUrls?.[0] ??
    null

  const reserved =
    item.reservedQuantity ??
    0

  const completed =
    item.completedQuantity ??
    0

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="flex w-full items-center gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left"
    >
      <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-input bg-error-bg text-primary-700">
        {image ? (
          <img
            src={
              image
            }
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <Package
            aria-hidden
            size={28}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate typography-title-3 text-neutral-900">
          {
            item.itemName
          }{' '}
          {
            item.quantity
          }
          {
            item.unit
          }
        </h2>

        <p className="mt-1 typography-label-2 text-neutral-700">
          예약 수량{' '}
          {reserved}{item.unit} · 전달 완료{' '}
          {completed}{item.unit}
        </p>

        <p className="typography-label-2 text-neutral-700">
          신청 가능 수량{' '}
          {item.availableQuantity}{item.unit}
        </p>

        <span
          className={`mt-2 inline-flex h-7 items-center rounded-pill px-3 typography-label-2 ${
            item.status ===
            'RECRUITING'
              ? 'bg-neutral-100 text-neutral-700'
              : item.status ===
                  'FULL'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-success-bg text-success'
          }`}
        >
          {
            statusLabels[
              item.status
            ]
          }
        </span>
      </div>
    </button>
  )
}

function shortCategoryName(
  category: string,
) {
  switch (category) {
    case '생활용품':
      return '생활'

    case '도서·문구':
      return '도서'

    case '의류·잡화':
      return '의류'

    case '유아·아동용품':
      return '유아'

    default:
      return category
  }
}
