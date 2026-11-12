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
  useSearchParams,
} from 'react-router-dom'

import {
  BottomNavigation,
} from '@/components/common/BottomNavigation/BottomNavigation'

import {
  DonorPage,
} from '@/features/donor/DonorPage'

import {
  useItemCategoriesQuery,
} from '@/hooks/queries/useItemCategoriesQuery'

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

const CONDITION_LABELS: Record<
  ItemConditionCode,
  string
> = {
  HIGH: '상 · 미개봉',
  MID: '중 · 사용감 적음',
  LOW: '하 · 다회 사용',
}

function parsePositiveId(
  value: string | null,
) {
  if (
    !value ||
    !/^[1-9]\d*$/.test(value)
  ) {
    return undefined
  }

  const id =
    Number(value)

  return Number.isSafeInteger(
    id,
  )
    ? id
    : undefined
}

function parseCondition(
  value: string | null,
):
  | ItemConditionCode
  | undefined {
  if (
    value === 'HIGH' ||
    value === 'MID' ||
    value === 'LOW'
  ) {
    return value
  }

  return undefined
}

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
    searchParams,
    setSearchParams,
  ] =
    useSearchParams()

  const keywordParam =
    searchParams.get(
      'keyword',
    ) ?? ''

  const [
    keyword,
    setKeyword,
  ] =
    useState(
      keywordParam,
    )

  const loadMoreRef =
    useRef<HTMLDivElement>(
      null,
    )

  const categoryQuery =
    useItemCategoriesQuery()

  const categoryId =
    parsePositiveId(
      searchParams.get(
        'categoryId',
      ),
    )

  const regionId =
    parsePositiveId(
      searchParams.get(
        'regionId',
      ),
    )

  const condition =
    parseCondition(
      searchParams.get(
        'condition',
      ),
    )

  useEffect(() => {
    setKeyword(
      keywordParam,
    )
  }, [
    keywordParam,
  ])

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          const nextKeyword =
            keyword.trim()

          const currentKeyword =
            searchParams.get(
              'keyword',
            ) ?? ''

          if (
            nextKeyword ===
            currentKeyword
          ) {
            return
          }

          const next =
            new URLSearchParams(
              searchParams,
            )

          if (
            nextKeyword
          ) {
            next.set(
              'keyword',
              nextKeyword,
            )
          } else {
            next.delete(
              'keyword',
            )
          }

          setSearchParams(
            next,
            {
              replace:
                true,
            },
          )
        },

        300,
      )

    return () => {
      window.clearTimeout(
        timer,
      )
    }
  }, [
    keyword,
    searchParams,
    setSearchParams,
  ])

  const selectedCategoryName =
    categoryQuery.data?.find(
      (category) =>
        category.categoryId ===
        categoryId,
    )?.name

  const browseParams =
    useMemo(
      () => ({
        keyword:
          keywordParam ||
          undefined,

        categoryId,

        regionId,

        condition,
      }),

      [
        keywordParam,
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

      void query
        .fetchNextPage()
        .catch(
          () =>
            undefined,
        )
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
        (
          entries,
        ) => {
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

  const openFilterPage =
    () => {
      const queryString =
        searchParams.toString()

      navigate(
        `${ROUTES.donor.needFilter}${
          queryString
            ? `?${queryString}`
            : ''
        }`,
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

      <div className="flex w-full gap-2 overflow-x-auto">
        <FilterChip
          label={
            selectedCategoryName ??
            '카테고리'
          }
          active={
            categoryId !==
            undefined
          }
          onClick={
            openFilterPage
          }
        />

        <FilterChip
          label={
            regionId ===
            PILOT_REGION.id
              ? PILOT_REGION.name
              : '지역'
          }
          active={
            regionId !==
            undefined
          }
          onClick={
            openFilterPage
          }
        />

        <FilterChip
          label={
            condition
              ? CONDITION_LABELS[
                  condition
                ]
              : '희망 상태'
          }
          active={
            condition !==
            undefined
          }
          onClick={
            openFilterPage
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
            (
              item,
            ) => (
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
              더 불러오고
              있어요.
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

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={
        active
          ? 'h-7 shrink-0 rounded-pill border border-primary-300 bg-primary-100 px-3 typography-label-1 text-primary-700'
          : 'h-7 shrink-0 rounded-pill border border-neutral-200 bg-white px-3 typography-label-1 text-neutral-700'
      }
      onClick={
        onClick
      }
    >
      {label}
    </button>
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
            {
              item.itemName
            }{' '}
            {
              item.availableQuantity
            }
            {
              item.unit
            }
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