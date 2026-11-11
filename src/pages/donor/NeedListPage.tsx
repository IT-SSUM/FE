import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  Package,
  Search,
} from 'lucide-react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  BottomNavigation,
} from '@/components/common/BottomNavigation/BottomNavigation'

import {
  FilterSelect,
} from '@/components/common/FilterSelect/FilterSelect'

import {
  DonorPage,
} from '@/features/donor/DonorPage'

import {
  useItemCategoriesQuery,
} from '@/hooks/queries/useItemCategoriesQuery'

import {
  useItemConditionsQuery,
} from '@/hooks/queries/useItemConditionsQuery'

import {
  useInfiniteNeededItemsQuery,
} from '@/hooks/queries/useNeededItemsQuery'

import {
  getNeededItemErrorMessage,
} from '@/apis/neededItem'

import {
  ROUTES,
  routePath,
} from '@/routes/paths'

import type {
  ItemConditionCode,
} from '@/types/item'

import type {
  NeededItemListItem,
} from '@/types/neededItem'

const PILOT_REGION = {
  id: 1,
  name: '경기 부천시',
} as const

function desiredConditionLabel(
  condition: ItemConditionCode,
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

export function NeedListPage() {
  const navigate =
    useNavigate()

  const [
    keyword,
    setKeyword,
  ] =
    useState('')

  const [
    debouncedKeyword,
    setDebouncedKeyword,
  ] =
    useState('')

  const [
    categoryId,
    setCategoryId,
  ] =
    useState<
      number | undefined
    >()

  const [
    regionId,
    setRegionId,
  ] =
    useState<
      number | undefined
    >()

  const [
    condition,
    setCondition,
  ] =
    useState<
      ItemConditionCode | undefined
    >()

  const loadMoreRef =
    useRef<HTMLDivElement>(
      null,
    )

  const categoryQuery =
    useItemCategoriesQuery()

  const conditionQuery =
    useItemConditionsQuery()

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setDebouncedKeyword(
            keyword.trim(),
          )
        },
        300,
      )

    return () =>
      window.clearTimeout(
        timer,
      )
  }, [keyword])

  const categoryOptions =
    useMemo(
      () =>
        categoryQuery.data?.map(
          (category) =>
            category.name,
        ) ?? [],
      [
        categoryQuery.data,
      ],
    )

  const conditionOptions =
    useMemo(
      () =>
        conditionQuery.data?.map(
          (item) =>
            item.description,
        ) ?? [],
      [
        conditionQuery.data,
      ],
    )

  const selectedCategoryName =
    categoryQuery.data?.find(
      (category) =>
        category.categoryId ===
        categoryId,
    )?.name ?? ''

  const selectedConditionName =
    conditionQuery.data?.find(
      (item) =>
        item.code ===
        condition,
    )?.description ?? ''

  const selectedRegionName =
    regionId ===
    PILOT_REGION.id
      ? PILOT_REGION.name
      : ''

  const browseParams =
    useMemo(
      () => ({
        keyword:
          debouncedKeyword ||
          undefined,

        categoryId,

        regionId,

        condition,
      }),
      [
        debouncedKeyword,
        categoryId,
        regionId,
        condition,
      ],
    )

  const query =
    useInfiniteNeededItemsQuery(
      browseParams,
    )

  const items =
    useMemo(
      () =>
        query.data?.pages.flatMap(
          (page) =>
            page.items,
        ) ?? [],
      [
        query.data,
      ],
    )

  const fetchNextPage =
    useCallback(() => {
      if (
        !query.hasNextPage ||
        query.isFetchingNextPage
      ) {
        return
      }

      query
        .fetchNextPage()
        .catch(() => {
          // 에러 상태는 TanStack Query가 관리합니다.
        })
    }, [
      query.hasNextPage,
      query.isFetchingNextPage,
      query.fetchNextPage,
    ])

  useEffect(() => {
    const element =
      loadMoreRef.current

    if (
      !element ||
      !query.hasNextPage ||
      query.isFetchingNextPage
    ) {
      return
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0]

          if (
            entry?.isIntersecting
          ) {
            fetchNextPage()
          }
        },
        {
          rootMargin:
            '160px',
        },
      )

    observer.observe(
      element,
    )

    return () => {
      observer.disconnect()
    }
  }, [
    query.hasNextPage,
    query.isFetchingNextPage,
    fetchNextPage,
  ])

  const handleCategoryChange =
    (
      value:
        string,
    ) => {
      if (!value) {
        setCategoryId(
          undefined,
        )

        return
      }

      const category =
        categoryQuery.data?.find(
          (item) =>
            item.name ===
            value,
        )

      setCategoryId(
        category?.categoryId,
      )
    }

  const handleConditionChange =
    (
      value:
        string,
    ) => {
      if (!value) {
        setCondition(
          undefined,
        )

        return
      }

      const nextCondition =
        conditionQuery.data?.find(
          (item) =>
            item.description ===
            value,
        )

      setCondition(
        nextCondition?.code,
      )
    }

  const handleRegionChange =
    (
      value:
        string,
    ) => {
      setRegionId(
        value
          ? PILOT_REGION.id
          : undefined,
      )
    }

  return (
    <DonorPage
      title="물품 탐색"
      back={
        ROUTES.donor.home
      }
      footer={
        <BottomNavigation
          activeItem="explore"
          className="sticky bottom-0 z-20 shrink-0"
        />
      }
    >
      <label className="relative block w-full">
        <span className="sr-only">
          품목 또는 기관명 검색
        </span>

        <Search
          aria-hidden
          size={18}
          strokeWidth={2}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700"
        />

        <input
          type="search"
          value={
            keyword
          }
          placeholder="품목 또는 기관명 검색"
          className="h-[54px] w-full rounded-input border border-neutral-500 bg-white pl-[46px] pr-4 typography-body-1 text-neutral-900 outline-none transition-colors placeholder:text-neutral-600 focus:border-primary-700"
          onChange={(
            event,
          ) =>
            setKeyword(
              event.target.value,
            )
          }
        />
      </label>

      <div
        data-filter-boundary
        className="flex w-full gap-2 overflow-x-auto"
      >
        <FilterSelect
          label="카테고리"
          value={
            selectedCategoryName
          }
          options={
            categoryOptions
          }
          showMenuLabel={
            false
          }
          showChevron={
            false
          }
          onChange={
            handleCategoryChange
          }
        />

        <FilterSelect
          label="지역"
          value={
            selectedRegionName
          }
          options={[
            PILOT_REGION.name,
          ]}
          showMenuLabel={
            false
          }
          showChevron={
            false
          }
          onChange={
            handleRegionChange
          }
        />

        <FilterSelect
          label="희망 상태"
          value={
            selectedConditionName
          }
          options={
            conditionOptions
          }
          showMenuLabel={
            false
          }
          showChevron={
            false
          }
          onChange={
            handleConditionChange
          }
        />
      </div>

      {query.isPending ? (
        <div
          role="status"
          className="rounded-card border border-neutral-200 bg-white p-6 text-center"
        >
          <p className="typography-body-2 text-neutral-700">
            필요한 물품을
            불러오고 있어요.
          </p>
        </div>
      ) : query.isError ? (
        <div
          role="alert"
          className="rounded-card border border-neutral-200 bg-white p-6 text-center"
        >
          <p className="typography-body-2 text-error">
            {getNeededItemErrorMessage(
              query.error,
              '필요 물품 목록을 불러오지 못했어요.',
            )}
          </p>

          <button
            type="button"
            className="mt-3 typography-label-1 text-primary-700 underline"
            onClick={() => {
              void query.refetch()
            }}
          >
            다시 시도
          </button>
        </div>
      ) : items.length ===
        0 ? (
        <div className="rounded-card border border-neutral-200 bg-white p-6 text-center">
          <p className="typography-title-3 text-neutral-900">
            조건에 맞는
            필요 물품이 없어요.
          </p>

          <p className="mt-2 typography-body-2 text-neutral-700">
            검색어나 필터를
            변경해 보세요.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(
            (item) => (
              <NeededItemCard
                key={
                  item.neededItemId
                }
                item={
                  item
                }
                onClick={() =>
                  navigate(
                    routePath.donorNeedDetail(
                      String(
                        item.neededItemId,
                      ),
                    ),
                  )
                }
              />
            ),
          )}

          <div
            ref={
              loadMoreRef
            }
            className="h-1"
            aria-hidden
          />

          {query.isFetchingNextPage ? (
            <p
              role="status"
              className="py-2 text-center typography-label-2 text-neutral-600"
            >
              더 불러오고 있어요.
            </p>
          ) : null}

          {query.isFetchNextPageError ? (
            <div className="text-center">
              <p className="typography-label-2 text-error">
                다음 물품을
                불러오지 못했어요.
              </p>

              <button
                type="button"
                className="mt-2 typography-label-1 text-primary-700 underline"
                onClick={
                  fetchNextPage
                }
              >
                다시 시도
              </button>
            </div>
          ) : null}
        </div>
      )}
    </DonorPage>
  )
}

function NeededItemCard({
  item,
  onClick,
}: {
  item:
    NeededItemListItem

  onClick:
    () => void
}) {
  return (
    <button
      type="button"
      className="w-full rounded-card border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
      onClick={
        onClick
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-[68px] w-16 shrink-0 items-center justify-center overflow-hidden rounded-input bg-error-bg text-primary-700">
          {item.referenceImageUrl ? (
            <img
              src={
                item.referenceImageUrl
              }
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <Package
              aria-hidden
              size={28}
              strokeWidth={2}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate typography-title-3 text-neutral-900">
            {item.itemName}{' '}
            {
              item.availableQuantity
            }
            {item.unit}
          </h2>

          <p className="mt-1 truncate typography-label-2 text-neutral-700">
            {
              item.organizationName
            }{' '}
            ·{' '}
            {
              item.regionName
            }
          </p>

          <p className="mt-1 truncate typography-label-2 text-neutral-700">
            {
              item.categoryName
            }{' '}
            · 희망 상태{' '}
            {desiredConditionLabel(
              item.desiredCondition,
            )}
          </p>
        </div>
      </div>
    </button>
  )
}