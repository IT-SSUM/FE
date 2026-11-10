import {
  Package,
} from 'lucide-react'

import {
  Link,
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

const statusFilters: Array<{
  value:
    | ''
    | DonationItemStatus

  label: string
}> = [
  {
    value: '',
    label: '전체',
  },
  {
    value: 'RECRUITING',
    label: '모집 중',
  },
  {
    value: 'FULL',
    label: '모집 완료',
  },
  {
    value: 'COMPLETED',
    label: '기부 완료',
  },
]

const statusLabels: Record<
  DonationItemStatus,
  string
> = {
  RECRUITING:
    '모집 중',

  FULL:
    '모집 완료',

  COMPLETED:
    '기부 완료',
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

  const filter =
    params.get(
      'status',
    ) ?? ''

  const items =
    query.data ??
    []

  const filtered =
    items.filter(
      (item) =>
        !filter ||
        item.status ===
          filter,
    )

  return (
    <DonorPage
      title="등록한 물품 관리"
      back={
        ROUTES.donor.myPage
      }
      footer={
        <BottomNavigation
          activeItem="my"
        />
      }
    >
      <section className="flex items-center justify-between rounded-card bg-primary-100 p-4">
        <div>
          <p className="typography-label-2 text-neutral-700">
            내가 등록한
            기부 물품
          </p>

          <h2 className="mt-1 typography-title-2 text-neutral-900">
            등록 물품{' '}
            {items.length}개
          </h2>
        </div>

        <Link
          to={
            ROUTES.donor
              .donationNew
          }
          className="typography-label-1 text-primary-700"
        >
          물품 등록
        </Link>
      </section>

      {query.isPending ? (
        <p
          role="status"
          className="py-8 text-center typography-body-2 text-neutral-700"
        >
          등록한 물품을
          불러오고 있어요.
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
            disabled={
              query.isFetching
            }
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
            {statusFilters.map(
              ({
                value,
                label,
              }) => {
                const count =
                  items.filter(
                    (item) =>
                      !value ||
                      item.status ===
                        value,
                  ).length

                return (
                  <button
                    key={
                      value ||
                      'all'
                    }
                    type="button"
                    aria-pressed={
                      filter ===
                      value
                    }
                    onClick={() =>
                      setParams(
                        value
                          ? {
                              status:
                                value,
                            }
                          : {},
                        {
                          replace:
                            true,
                        },
                      )
                    }
                    className={`shrink-0 rounded-pill border border-neutral-200 px-3 py-2 typography-label-1 ${
                      filter ===
                      value
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-white text-neutral-700'
                    }`}
                  >
                    {label}{' '}
                    {count}
                  </button>
                )
              },
            )}
          </div>

          <p
            role="status"
            className="typography-label-2 text-neutral-700"
          >
            {filtered.length}
            개 물품
          </p>

          {filtered.length >
          0 ? (
            <section className="space-y-3">
              {filtered.map(
                (item) => (
                  <DonationItemRow
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
          ) : (
            <EmptyState
              title={
                filter
                  ? '해당 상태의 물품이 없어요'
                  : '등록된 물품이 없어요'
              }
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

function DonationItemRow({
  item,
  onClick,
}: {
  item: MyDonationItem
  onClick: () => void
}) {
  const image =
    item.imageUrl ??
    item.imageUrls?.[0] ??
    undefined

  const categoryText =
    item.categoryName ??
    '기부 물품'

  const regionText =
    item.regionName
      ? ` · ${item.regionName}`
      : ''

  return (
    <ItemRow
      title={`${item.itemName} ${item.quantity}${item.unit}`}
      description={
        <>
          <p>
            {categoryText}
            {regionText}
          </p>

          <p>
            남은 수량{' '}
            {
              item.availableQuantity
            }
            {item.unit} ·{' '}
            {
              statusLabels[
                item.status
              ]
            }
          </p>
        </>
      }
      imageSrc={
        image
      }
      icon={
        <Package
          aria-hidden
          size={28}
        />
      }
      thumbnailClassName="h-[68px] w-16 rounded-input !bg-error-bg"
      className="gap-3 p-4 shadow-none"
      titleClassName="typography-title-3"
      descriptionClassName="typography-label-2 line-clamp-none"
      onClick={
        onClick
      }
    />
  )
}