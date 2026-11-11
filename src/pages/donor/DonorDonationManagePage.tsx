import {
  Package,
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
  RECRUITING: '모집중',
  FULL: '예약마감',
  COMPLETED: '전달 완료',
}

function shortCategory(
  value:
    string | undefined,
) {
  switch (value) {
    case '생활용품':
      return '생활'

    case '도서·문구':
      return '도서'

    case '의류·잡화':
      return '의류'

    case '유아·아동용품':
      return '유아'

    default:
      return value ?? '기타'
  }
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
        ROUTES.donor.myPage
      }
      footer={
        <div className="shrink-0">
          <div className="bg-surface-canvas px-5 pb-3 pt-2">
            <Button
              className="w-full"
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

          <BottomNavigation
            activeItem="my"
          />
        </div>
      }
    >
      {query.isPending ? (
        <p
          role="status"
          className="py-8 text-center typography-body-2 text-neutral-700"
        >
          등록한 물품을 불러오고 있어요.
        </p>
      ) : null}

      {query.isError ? (
        <section className="rounded-card border border-error/30 bg-error-bg p-5">
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
            <FilterChip
              active={!filter}
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
                <FilterChip
                  key={category}
                  active={
                    filter ===
                    category
                  }
                  label={shortCategory(
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

          {filtered.length ? (
            <section className="space-y-3">
              {filtered.map(
                (item) => (
                  <DonationItemRow
                    key={
                      item.donationItemId
                    }
                    item={item}
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

function FilterChip({
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
          ? 'shrink-0 rounded-pill border border-primary-700 bg-primary-700 px-3 py-2 typography-label-1 text-white'
          : 'shrink-0 rounded-pill border border-neutral-200 bg-white px-3 py-2 typography-label-1 text-neutral-700'
      }
    >
      {label}
    </button>
  )
}

function DonationItemRow({
  item,
  onClick,
}: {
  item: MyDonationItem
  onClick: () => void
}) {
  const reserved =
    item.reservedQuantity ??
    0

  const completed =
    item.completedQuantity ??
    0

  const image =
    item.imageUrl ??
    item.imageUrls?.[0] ??
    undefined

  return (
    <ItemRow
      title={`${item.itemName} ${item.quantity}${item.unit}`}
      description={
        <>
          <p>
            예약 수량{' '}
            {reserved} · 전달 완료{' '}
            {completed}
          </p>

          <p>
            신청 가능 수량{' '}
            {
              item.availableQuantity
            }{' '}
            (총 {item.quantity})
          </p>
        </>
      }
      imageSrc={image}
      icon={
        <Package
          aria-hidden
          size={28}
        />
      }
      status={
        item.status ===
        'COMPLETED'
          ? 'complete'
          : item.status ===
              'FULL'
            ? 'reserved'
            : 'trading'
      }
      statusType="transaction"
      thumbnailClassName="h-[68px] w-16 rounded-input !bg-error-bg"
      className="gap-3 p-4 shadow-none"
      titleClassName="typography-title-3"
      descriptionClassName="typography-label-2 line-clamp-none"
      onClick={onClick}
    />
  )
}